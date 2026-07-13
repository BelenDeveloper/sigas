import { Injectable } from "@nestjs/common";
import {
  db,
  schema,
  type CashEntryReferenceType,
  type CashEntryType,
  type CashSession,
  type PayableStatus,
  type PaymentMethod,
} from "@repo/db";
import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";

import {
  CashEntryNotFoundError,
  CashSessionNotFoundError,
  NoOpenSessionError,
  PayableNotFoundError,
  SessionAlreadyOpenError,
  type AddPayablePaymentInput,
  type AutoCashEntryInput,
  type CashEntry,
  type CashEntryFilters,
  type CreatePayableInput,
  type DailySummary,
  type ManualCashEntryInput,
  type PartnerDistribution,
  type PartnerDistributionInput,
  type PayableAccount,
  type PayableFilters,
  type PayablePayment,
  type WhereIsTheMoneyEntry,
} from "./cash.types.js";

const OPEN_SESSION_STATUS = "open";
const CLOSED_SESSION_STATUS = "closed";

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function computePayableStatus(payable: {
  amount: string;
  paidAmount: string;
  dueDate: string | null;
}): PayableStatus {
  const amount = Number(payable.amount);
  const paidAmount = Number(payable.paidAmount);

  if (paidAmount >= amount) {
    return "paid";
  }

  if (payable.dueDate && payable.dueDate < todayISODate()) {
    return "overdue";
  }

  return paidAmount > 0 ? "partial" : "pending";
}

@Injectable()
export class CashService {
  async getCurrentSession(): Promise<CashSession | null> {
    const [session] = await db
      .select()
      .from(schema.cashSessions)
      .where(eq(schema.cashSessions.status, OPEN_SESSION_STATUS))
      .orderBy(desc(schema.cashSessions.openedAt))
      .limit(1);

    return session ?? null;
  }

  async openSession(userId: string): Promise<CashSession> {
    const currentSession = await this.getCurrentSession();

    if (currentSession) {
      throw new SessionAlreadyOpenError();
    }

    const [session] = await db
      .insert(schema.cashSessions)
      .values({ openedBy: userId })
      .returning();

    if (!session) {
      throw new Error("Failed to open cash session");
    }

    return session;
  }

  async closeSession(sessionId: string, closingAmount: number): Promise<CashSession> {
    const [session] = await db
      .update(schema.cashSessions)
      .set({
        status: CLOSED_SESSION_STATUS,
        closedAt: new Date(),
        closingAmount: closingAmount.toString(),
      })
      .where(eq(schema.cashSessions.id, sessionId))
      .returning();

    if (!session) {
      throw new CashSessionNotFoundError(sessionId);
    }

    return session;
  }

  async getEntries(filters: CashEntryFilters): Promise<CashEntry[]> {
    const conditions = [];

    if (filters.sessionId) {
      conditions.push(eq(schema.cashEntries.sessionId, filters.sessionId));
    }

    if (filters.type) {
      conditions.push(eq(schema.cashEntries.type, filters.type));
    }

    if (filters.category) {
      conditions.push(eq(schema.cashEntries.category, filters.category));
    }

    if (filters.method) {
      conditions.push(eq(schema.cashEntries.paymentMethod, filters.method));
    }

    if (filters.dateFrom) {
      conditions.push(gte(schema.cashEntries.createdAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(schema.cashEntries.createdAt, filters.dateTo));
    }

    const query = db.select().from(schema.cashEntries).orderBy(desc(schema.cashEntries.createdAt));

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  }

  async addManualEntry(input: ManualCashEntryInput, userId: string): Promise<CashEntry> {
    const currentSession = await this.getCurrentSession();

    if (!currentSession) {
      throw new NoOpenSessionError();
    }

    return this.insertEntry({
      sessionId: currentSession.id,
      type: input.type,
      category: input.category,
      description: input.description,
      paymentMethod: input.paymentMethod,
      accountDestination: input.accountDestination,
      amount: input.amount,
      createdBy: userId,
    });
  }

  async createAutomaticEntry(input: AutoCashEntryInput): Promise<CashEntry> {
    let currentSession = await this.getCurrentSession();

    if (!currentSession) {
      currentSession = await this.openSession(input.createdBy);
    }

    return this.insertEntry({
      sessionId: currentSession.id,
      type: input.type,
      category: input.category,
      description: input.description,
      paymentMethod: input.paymentMethod,
      accountDestination: input.accountDestination,
      amount: input.amount,
      referenceId: input.referenceId,
      referenceType: input.referenceType,
      createdBy: input.createdBy,
    });
  }

  async addPartnerDistribution(
    input: PartnerDistributionInput,
    userId: string,
  ): Promise<PartnerDistribution> {
    const currentSession = await this.getCurrentSession();

    if (!currentSession) {
      throw new NoOpenSessionError();
    }

    const [distribution] = await db
      .insert(schema.partnerDistributions)
      .values({
        sessionId: currentSession.id,
        partnerName: input.partnerName,
        amount: input.amount.toString(),
        paymentMethod: input.paymentMethod,
        accountDestination: input.accountDestination,
        createdBy: userId,
      })
      .returning();

    if (!distribution) {
      throw new Error("Failed to record partner distribution");
    }

    return distribution;
  }

  async getWhereIsTheMoney(sessionId?: string): Promise<WhereIsTheMoneyEntry[]> {
    const conditions = [eq(schema.cashEntries.cancelled, false)];

    if (sessionId) {
      conditions.push(eq(schema.cashEntries.sessionId, sessionId));
    }

    const entries = await db
      .select()
      .from(schema.cashEntries)
      .where(and(...conditions));

    const totalByDestination = new Map<string, number>();

    for (const entry of entries) {
      const destination = entry.accountDestination ?? "Sin destino";
      const signedAmount = entry.type === "income" ? Number(entry.amount) : -Number(entry.amount);
      totalByDestination.set(destination, (totalByDestination.get(destination) ?? 0) + signedAmount);
    }

    return Array.from(totalByDestination.entries()).map(([destination, total]) => ({
      destination,
      total,
    }));
  }

  async getDailySummary(sessionId: string): Promise<DailySummary> {
    const entries = await db
      .select()
      .from(schema.cashEntries)
      .where(and(eq(schema.cashEntries.sessionId, sessionId), eq(schema.cashEntries.cancelled, false)));

    const totalIncome = entries
      .filter((entry) => entry.type === "income")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const totalExpense = entries
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }

  async cancelEntry(entryId: string): Promise<CashEntry> {
    const [entry] = await db
      .update(schema.cashEntries)
      .set({ cancelled: true })
      .where(eq(schema.cashEntries.id, entryId))
      .returning();

    if (!entry) {
      throw new CashEntryNotFoundError(entryId);
    }

    return entry;
  }

  async listPayables(filters: PayableFilters): Promise<PayableAccount[]> {
    const conditions = [];

    if (filters.creditorType) {
      conditions.push(eq(schema.payableAccounts.creditorType, filters.creditorType));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(schema.payableAccounts.creditorName, searchPattern),
          ilike(schema.payableAccounts.invoiceNumber, searchPattern),
        ),
      );
    }

    const query = db
      .select()
      .from(schema.payableAccounts)
      .orderBy(desc(schema.payableAccounts.createdAt));

    const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
    const payables = rows.map((payable) => ({ ...payable, status: computePayableStatus(payable) }));

    return filters.status ? payables.filter((payable) => payable.status === filters.status) : payables;
  }

  async createPayable(input: CreatePayableInput, userId: string): Promise<PayableAccount> {
    const [payable] = await db
      .insert(schema.payableAccounts)
      .values({
        creditorType: input.creditorType,
        supplierId: input.supplierId,
        creditorName: input.creditorName,
        purchaseId: input.purchaseId,
        amount: input.amount.toString(),
        dueDate: input.dueDate,
        category: input.category,
        invoiceNumber: input.invoiceNumber,
        reference: input.reference,
        notes: input.notes,
        createdBy: userId,
      })
      .returning();

    if (!payable) {
      throw new Error(`Failed to create payable account: ${input.creditorName}`);
    }

    return { ...payable, status: computePayableStatus(payable) };
  }

  async addPayablePayment(
    payableId: string,
    payment: AddPayablePaymentInput,
    userId: string,
  ): Promise<PayablePayment> {
    const [payable] = await db
      .select()
      .from(schema.payableAccounts)
      .where(eq(schema.payableAccounts.id, payableId))
      .limit(1);

    if (!payable) {
      throw new PayableNotFoundError(payableId);
    }

    const [payablePayment] = await db
      .insert(schema.payablePayments)
      .values({
        payableId,
        amount: payment.amount.toString(),
        paymentMethod: payment.paymentMethod,
        destination: payment.destination,
        createdBy: userId,
      })
      .returning();

    if (!payablePayment) {
      throw new Error(`Failed to record payment for payable: ${payableId}`);
    }

    const newPaidAmount = Number(payable.paidAmount) + payment.amount;
    const newStatus = computePayableStatus({
      amount: payable.amount,
      paidAmount: newPaidAmount.toString(),
      dueDate: payable.dueDate,
    });

    await db
      .update(schema.payableAccounts)
      .set({ paidAmount: newPaidAmount.toString(), status: newStatus })
      .where(eq(schema.payableAccounts.id, payableId));

    await this.createAutomaticEntry({
      type: "expense",
      category: payable.purchaseId ? "purchase" : "other_expense",
      description: `Payment to ${payable.creditorName}`,
      paymentMethod: payment.paymentMethod,
      accountDestination: payment.destination ?? "Sin destino",
      amount: payment.amount,
      referenceId: payable.purchaseId ?? payable.id,
      referenceType: payable.purchaseId ? "purchase" : "manual",
      createdBy: userId,
    });

    return payablePayment;
  }

  async getOverduePayables(): Promise<PayableAccount[]> {
    const payables = await this.listPayables({});
    return payables.filter((payable) => payable.status === "overdue");
  }

  async getPayablePayments(payableId: string): Promise<PayablePayment[]> {
    return db
      .select()
      .from(schema.payablePayments)
      .where(eq(schema.payablePayments.payableId, payableId))
      .orderBy(desc(schema.payablePayments.paidAt));
  }

  private async insertEntry(input: {
    sessionId: string;
    type: CashEntryType;
    category: string;
    description: string;
    paymentMethod: PaymentMethod;
    accountDestination?: string;
    amount: number;
    referenceId?: string;
    referenceType?: CashEntryReferenceType;
    createdBy: string;
  }): Promise<CashEntry> {
    const [entry] = await db
      .insert(schema.cashEntries)
      .values({
        sessionId: input.sessionId,
        type: input.type,
        category: input.category,
        description: input.description,
        paymentMethod: input.paymentMethod,
        accountDestination: input.accountDestination,
        amount: input.amount.toString(),
        referenceId: input.referenceId,
        referenceType: input.referenceType,
        createdBy: input.createdBy,
      })
      .returning();

    if (!entry) {
      throw new Error("Failed to create cash entry");
    }

    return entry;
  }
}
