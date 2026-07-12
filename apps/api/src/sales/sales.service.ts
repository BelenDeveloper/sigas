import { Injectable } from "@nestjs/common";
import { db, schema, type PaymentMethod, type Sale, type SaleStatus } from "@repo/db";
import { and, desc, eq, getTableColumns, gte, ilike, lte, or, sql } from "drizzle-orm";

import { InventoryService } from "../inventory/inventory.service.js";
import {
  EmptySaleError,
  SaleAlreadyCancelledError,
  SaleNotFoundError,
  type AddSalePaymentInput,
  type CreateSaleInput,
  type SaleBalance,
  type SaleFilters,
  type SaleListItem,
  type SalePayment,
  type SaleWithRelations,
} from "./sales.types.js";

const SALE_TYPE_CODE_PREFIXES: Record<Sale["type"], string> = {
  quotation: "COT",
  order: "PED",
  sale: "VTA",
  return: "DEV",
};

const SALE_CODE_PADDING_LENGTH = 4;

// Placeholder for the automatic cash entry created when a sale payment is
// recorded. Wire a real implementation in once the Cash module exists.
export interface CashServicePort {
  createAutomaticEntry(input: {
    amount: number;
    paymentMethod: PaymentMethod;
    accountDestination: string | undefined;
    referenceId: string;
    referenceType: "sale";
    createdBy: string;
  }): Promise<void>;
}

@Injectable()
export class SalesService {
  private readonly inventoryService = new InventoryService();
  // cashService will be injected once the Cash module is built — see clients.service.ts
  // for the same forward-reference convention (getClientDebt).
  private readonly cashService: CashServicePort | undefined = undefined;

  async findAll(filters: SaleFilters): Promise<SaleListItem[]> {
    const conditions = [];

    if (filters.clientId) {
      conditions.push(eq(schema.sales.clientId, filters.clientId));
    }

    if (filters.type) {
      conditions.push(eq(schema.sales.type, filters.type));
    }

    if (filters.status) {
      conditions.push(eq(schema.sales.status, filters.status));
    }

    if (filters.dateFrom) {
      conditions.push(gte(schema.sales.saleDate, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(schema.sales.saleDate, filters.dateTo));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(or(ilike(schema.sales.code, searchPattern), ilike(schema.clients.name, searchPattern)));
    }

    const query = db
      .select({
        ...getTableColumns(schema.sales),
        clientName: schema.clients.name,
        itemCount: sql<number>`(select count(*)::int from ${schema.saleItems} where ${schema.saleItems.saleId} = ${schema.sales.id})`,
        totalPaid: sql<string>`coalesce((select sum(${schema.salePayments.amount}) from ${schema.salePayments} where ${schema.salePayments.saleId} = ${schema.sales.id}), 0)`,
      })
      .from(schema.sales)
      .leftJoin(schema.clients, eq(schema.sales.clientId, schema.clients.id))
      .orderBy(desc(schema.sales.saleDate));

    const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

    return rows.map((row) => {
      const totalPaid = Number(row.totalPaid);

      return {
        ...row,
        clientName: row.clientName,
        itemCount: row.itemCount,
        totalPaid,
        totalPending: Number(row.total) - totalPaid,
      };
    });
  }

  async findById(id: string): Promise<SaleWithRelations> {
    const [sale] = await db.select().from(schema.sales).where(eq(schema.sales.id, id)).limit(1);

    if (!sale) {
      throw new SaleNotFoundError(id);
    }

    const items = await db
      .select({
        ...getTableColumns(schema.saleItems),
        productName: schema.products.name,
        productSku: schema.products.sku,
      })
      .from(schema.saleItems)
      .innerJoin(schema.products, eq(schema.saleItems.productId, schema.products.id))
      .where(eq(schema.saleItems.saleId, id));

    const payments = await db
      .select()
      .from(schema.salePayments)
      .where(eq(schema.salePayments.saleId, id))
      .orderBy(desc(schema.salePayments.paidAt));

    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return {
      ...sale,
      items,
      payments,
      totalPaid,
      totalPending: Number(sale.total) - totalPaid,
    };
  }

  async create(input: CreateSaleInput, userId: string): Promise<Sale> {
    if (input.items.length === 0) {
      throw new EmptySaleError();
    }

    const itemsWithSubtotal = input.items.map((item) => ({
      ...item,
      subtotal: item.quantity * item.unitPrice,
    }));

    const subtotal = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = input.discount ?? 0;
    const total = subtotal - discount;
    const code = await this.generateNextCode(input.type);

    const sale = await db.transaction(async (tx) => {
      const [insertedSale] = await tx
        .insert(schema.sales)
        .values({
          code,
          type: input.type,
          clientId: input.clientId,
          companyId: input.companyId,
          saleDate: input.saleDate,
          notes: input.notes,
          subtotal: subtotal.toString(),
          discount: discount.toString(),
          total: total.toString(),
          createdBy: userId,
        })
        .returning();

      if (!insertedSale) {
        throw new Error(`Failed to create sale: ${code}`);
      }

      await tx.insert(schema.saleItems).values(
        itemsWithSubtotal.map((item) => ({
          saleId: insertedSale.id,
          productId: item.productId,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          subtotal: item.subtotal.toString(),
          notes: item.notes,
        })),
      );

      return insertedSale;
    });

    if (input.type === "sale") {
      for (const item of itemsWithSubtotal) {
        await this.inventoryService.adjustStock(item.productId, -item.quantity, `Sale ${code}`, userId, {
          id: sale.id,
          type: "sale",
        });
      }
    }

    return sale;
  }

  async addPayment(saleId: string, payment: AddSalePaymentInput, userId: string): Promise<SalePayment> {
    const [sale] = await db.select().from(schema.sales).where(eq(schema.sales.id, saleId)).limit(1);

    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    const [salePayment] = await db
      .insert(schema.salePayments)
      .values({
        saleId,
        amount: payment.amount.toString(),
        paymentMethod: payment.paymentMethod,
        accountDestination: payment.accountDestination,
        notes: payment.notes,
        createdBy: userId,
      })
      .returning();

    if (!salePayment) {
      throw new Error(`Failed to record payment for sale: ${saleId}`);
    }

    if (this.cashService) {
      await this.cashService.createAutomaticEntry({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        accountDestination: payment.accountDestination,
        referenceId: saleId,
        referenceType: "sale",
        createdBy: userId,
      });
    }

    const balance = await this.getSaleBalance(saleId);
    const newStatus: SaleStatus = balance.totalPending <= 0 ? "paid" : "partial";

    await db
      .update(schema.sales)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(schema.sales.id, saleId));

    return salePayment;
  }

  async cancelSale(id: string, reason: string, userId: string): Promise<Sale> {
    const [sale] = await db.select().from(schema.sales).where(eq(schema.sales.id, id)).limit(1);

    if (!sale) {
      throw new SaleNotFoundError(id);
    }

    if (sale.status === "cancelled") {
      throw new SaleAlreadyCancelledError(id);
    }

    if (sale.type === "sale") {
      const items = await db.select().from(schema.saleItems).where(eq(schema.saleItems.saleId, id));

      for (const item of items) {
        await this.inventoryService.adjustStock(
          item.productId,
          Number(item.quantity),
          `Cancelled sale ${sale.code}`,
          userId,
          { id: sale.id, type: "sale" },
        );
      }
    }

    const updatedNotes = sale.notes ? `${sale.notes}\n\n${reason}` : reason;

    const [updatedSale] = await db
      .update(schema.sales)
      .set({ status: "cancelled", notes: updatedNotes, updatedAt: new Date() })
      .where(eq(schema.sales.id, id))
      .returning();

    if (!updatedSale) {
      throw new Error(`Failed to cancel sale: ${id}`);
    }

    return updatedSale;
  }

  async getSaleBalance(saleId: string): Promise<SaleBalance> {
    const [sale] = await db.select().from(schema.sales).where(eq(schema.sales.id, saleId)).limit(1);

    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    const payments = await db
      .select()
      .from(schema.salePayments)
      .where(eq(schema.salePayments.saleId, saleId));

    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const total = Number(sale.total);

    return { total, totalPaid, totalPending: total - totalPaid };
  }

  async generateNextCode(type: Sale["type"]): Promise<string> {
    const sequenceName = schema.SALE_CODE_SEQUENCE_NAMES[type];
    const result = await db.execute<{ nextval: string }>(
      sql`SELECT nextval(${sequenceName}::regclass) AS nextval`,
    );
    const nextValue = result.rows[0]?.nextval;

    if (!nextValue) {
      throw new Error(`Failed to generate next sale code for type: ${type}`);
    }

    return `${SALE_TYPE_CODE_PREFIXES[type]}-${nextValue.padStart(SALE_CODE_PADDING_LENGTH, "0")}`;
  }
}
