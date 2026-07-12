import { Injectable } from "@nestjs/common";
import { db, schema, type PaymentMethod, type Purchase, type PurchaseStatus } from "@repo/db";
import { and, desc, eq, getTableColumns, gte, lte, sql } from "drizzle-orm";

import { InventoryService } from "../inventory/inventory.service.js";
import {
  EmptyPurchaseError,
  PurchaseNotFoundError,
  type AddPurchasePaymentInput,
  type CreatePurchaseInput,
  type PurchaseBalance,
  type PurchaseFilters,
  type PurchaseListItem,
  type PurchasePayment,
  type PurchaseWithRelations,
} from "./purchases.types.js";

const PURCHASE_CODE_PREFIX = "COM";
const PURCHASE_CODE_PADDING_LENGTH = 4;

// Placeholder for the automatic cash entry created when a purchase payment is
// recorded. Wire a real implementation in once the Cash module is built — see
// sales.service.ts for the same forward-reference convention.
export interface CashServicePort {
  createAutomaticEntry(input: {
    amount: number;
    paymentMethod: PaymentMethod;
    accountDestination: string | undefined;
    referenceId: string;
    referenceType: "purchase";
    createdBy: string;
  }): Promise<void>;
}

@Injectable()
export class PurchasesService {
  private readonly inventoryService = new InventoryService();
  private readonly cashService: CashServicePort | undefined = undefined;

  async findAll(filters: PurchaseFilters): Promise<PurchaseListItem[]> {
    const conditions = [];

    if (filters.supplierId) {
      conditions.push(eq(schema.purchases.supplierId, filters.supplierId));
    }

    if (filters.status) {
      conditions.push(eq(schema.purchases.status, filters.status));
    }

    if (filters.dateFrom) {
      conditions.push(gte(schema.purchases.purchaseDate, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(schema.purchases.purchaseDate, filters.dateTo));
    }

    const query = db
      .select({
        ...getTableColumns(schema.purchases),
        supplierName: schema.suppliers.companyName,
        itemCount: sql<number>`(select count(*)::int from ${schema.purchaseItems} where ${schema.purchaseItems.purchaseId} = ${schema.purchases.id})`,
        totalPaid: sql<string>`coalesce((select sum(${schema.purchasePayments.amount}) from ${schema.purchasePayments} where ${schema.purchasePayments.purchaseId} = ${schema.purchases.id}), 0)`,
      })
      .from(schema.purchases)
      .leftJoin(schema.suppliers, eq(schema.purchases.supplierId, schema.suppliers.id))
      .orderBy(desc(schema.purchases.purchaseDate));

    const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

    return rows.map((row) => {
      const totalPaid = Number(row.totalPaid);

      return {
        ...row,
        supplierName: row.supplierName,
        itemCount: row.itemCount,
        totalPaid,
        totalPending: Number(row.total) - totalPaid,
      };
    });
  }

  async findById(id: string): Promise<PurchaseWithRelations> {
    const [purchase] = await db.select().from(schema.purchases).where(eq(schema.purchases.id, id)).limit(1);

    if (!purchase) {
      throw new PurchaseNotFoundError(id);
    }

    const items = await db
      .select({
        ...getTableColumns(schema.purchaseItems),
        productName: schema.products.name,
        productSku: schema.products.sku,
      })
      .from(schema.purchaseItems)
      .innerJoin(schema.products, eq(schema.purchaseItems.productId, schema.products.id))
      .where(eq(schema.purchaseItems.purchaseId, id));

    const payments = await db
      .select()
      .from(schema.purchasePayments)
      .where(eq(schema.purchasePayments.purchaseId, id))
      .orderBy(desc(schema.purchasePayments.paidAt));

    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return {
      ...purchase,
      items,
      payments,
      totalPaid,
      totalPending: Number(purchase.total) - totalPaid,
    };
  }

  async create(input: CreatePurchaseInput, userId: string): Promise<Purchase> {
    if (input.items.length === 0) {
      throw new EmptyPurchaseError();
    }

    const itemsWithSubtotal = input.items.map((item) => ({
      ...item,
      subtotal: item.quantity * item.unitCost,
    }));

    const total = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
    const code = await this.generateNextCode();

    const purchase = await db.transaction(async (tx) => {
      const [insertedPurchase] = await tx
        .insert(schema.purchases)
        .values({
          code,
          supplierId: input.supplierId,
          companyId: input.companyId,
          invoiceNumber: input.invoiceNumber,
          purchaseDate: input.purchaseDate,
          notes: input.notes,
          total: total.toString(),
          createdBy: userId,
        })
        .returning();

      if (!insertedPurchase) {
        throw new Error(`Failed to create purchase: ${code}`);
      }

      await tx.insert(schema.purchaseItems).values(
        itemsWithSubtotal.map((item) => ({
          purchaseId: insertedPurchase.id,
          productId: item.productId,
          quantity: item.quantity.toString(),
          unitCost: item.unitCost.toString(),
          subtotal: item.subtotal.toString(),
          notes: item.notes,
        })),
      );

      return insertedPurchase;
    });

    for (const item of itemsWithSubtotal) {
      await this.inventoryService.adjustStock(item.productId, item.quantity, `Purchase ${code}`, userId, {
        id: purchase.id,
        type: "purchase",
      });
    }

    return purchase;
  }

  async addPayment(
    purchaseId: string,
    payment: AddPurchasePaymentInput,
    userId: string,
  ): Promise<PurchasePayment> {
    const [purchase] = await db
      .select()
      .from(schema.purchases)
      .where(eq(schema.purchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      throw new PurchaseNotFoundError(purchaseId);
    }

    const [purchasePayment] = await db
      .insert(schema.purchasePayments)
      .values({
        purchaseId,
        amount: payment.amount.toString(),
        paymentMethod: payment.paymentMethod,
        accountDestination: payment.accountDestination,
        notes: payment.notes,
        createdBy: userId,
      })
      .returning();

    if (!purchasePayment) {
      throw new Error(`Failed to record payment for purchase: ${purchaseId}`);
    }

    if (this.cashService) {
      await this.cashService.createAutomaticEntry({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        accountDestination: payment.accountDestination,
        referenceId: purchaseId,
        referenceType: "purchase",
        createdBy: userId,
      });
    }

    const balance = await this.getPurchaseBalance(purchaseId);
    const newStatus: PurchaseStatus =
      balance.totalPending <= 0 ? "paid" : balance.totalPaid > 0 ? "partial" : "pending";

    await db
      .update(schema.purchases)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(schema.purchases.id, purchaseId));

    return purchasePayment;
  }

  async getPurchaseBalance(purchaseId: string): Promise<PurchaseBalance> {
    const [purchase] = await db
      .select()
      .from(schema.purchases)
      .where(eq(schema.purchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      throw new PurchaseNotFoundError(purchaseId);
    }

    const payments = await db
      .select()
      .from(schema.purchasePayments)
      .where(eq(schema.purchasePayments.purchaseId, purchaseId));

    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const total = Number(purchase.total);

    return { total, totalPaid, totalPending: total - totalPaid };
  }

  async generateNextCode(): Promise<string> {
    const result = await db.execute<{ nextval: string }>(
      sql`SELECT nextval('purchase_code_seq') AS nextval`,
    );
    const nextValue = result.rows[0]?.nextval;

    if (!nextValue) {
      throw new Error("Failed to generate next purchase code");
    }

    return `${PURCHASE_CODE_PREFIX}-${nextValue.padStart(PURCHASE_CODE_PADDING_LENGTH, "0")}`;
  }
}
