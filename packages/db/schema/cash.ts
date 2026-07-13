import { boolean, date, index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { PAYMENT_METHODS } from "./sales.js";
import { purchases } from "./purchases.js";
import { suppliers } from "./suppliers.js";
import { users } from "./users.js";

export const CASH_SESSION_STATUSES = ["open", "closed"] as const;
export type CashSessionStatus = (typeof CASH_SESSION_STATUSES)[number];

export const CASH_ENTRY_TYPES = ["income", "expense"] as const;
export type CashEntryType = (typeof CASH_ENTRY_TYPES)[number];

export const CASH_ENTRY_REFERENCE_TYPES = ["sale", "purchase", "project_expense", "manual"] as const;
export type CashEntryReferenceType = (typeof CASH_ENTRY_REFERENCE_TYPES)[number];

export const CASH_INCOME_CATEGORIES = ["sale", "collection", "other_income"] as const;
export type CashIncomeCategory = (typeof CASH_INCOME_CATEGORIES)[number];

export const CASH_EXPENSE_CATEGORIES = [
  "purchase",
  "technician_payment",
  "operating_expense",
  "partner_distribution",
  "other_expense",
] as const;
export type CashExpenseCategory = (typeof CASH_EXPENSE_CATEGORIES)[number];

export const CREDITOR_TYPES = ["supplier", "investor", "company_loan", "other"] as const;
export type CreditorType = (typeof CREDITOR_TYPES)[number];

export const PAYABLE_STATUSES = ["pending", "partial", "paid", "overdue"] as const;
export type PayableStatus = (typeof PAYABLE_STATUSES)[number];

export const cashSessions = pgTable("cash_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  openedBy: uuid("opened_by")
    .notNull()
    .references(() => users.id),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  closingAmount: numeric("closing_amount", { precision: 12, scale: 2 }),
  status: text("status", { enum: CASH_SESSION_STATUSES }).notNull().default("open"),
});

export type CashSession = typeof cashSessions.$inferSelect;
export type NewCashSession = typeof cashSessions.$inferInsert;

export const cashEntries = pgTable(
  "cash_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => cashSessions.id),
    type: text("type", { enum: CASH_ENTRY_TYPES }).notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
    accountDestination: text("account_destination"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    referenceId: uuid("reference_id"),
    referenceType: text("reference_type", { enum: CASH_ENTRY_REFERENCE_TYPES }),
    cancelled: boolean("cancelled").notNull().default(false),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("cash_entries_session_id_idx").on(table.sessionId),
    index("cash_entries_account_destination_idx").on(table.accountDestination),
  ],
);

export type CashEntry = typeof cashEntries.$inferSelect;
export type NewCashEntry = typeof cashEntries.$inferInsert;

export const partnerDistributions = pgTable("partner_distributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => cashSessions.id),
  partnerName: text("partner_name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
  accountDestination: text("account_destination"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PartnerDistribution = typeof partnerDistributions.$inferSelect;
export type NewPartnerDistribution = typeof partnerDistributions.$inferInsert;

export const payableAccounts = pgTable(
  "payable_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creditorType: text("creditor_type", { enum: CREDITOR_TYPES }).notNull(),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    creditorName: text("creditor_name").notNull(),
    purchaseId: uuid("purchase_id").references(() => purchases.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    status: text("status", { enum: PAYABLE_STATUSES }).notNull().default("pending"),
    dueDate: date("due_date"),
    category: text("category"),
    invoiceNumber: text("invoice_number"),
    reference: text("reference"),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("payable_accounts_status_idx").on(table.status),
    index("payable_accounts_due_date_idx").on(table.dueDate),
  ],
);

export type PayableAccount = typeof payableAccounts.$inferSelect;
export type NewPayableAccount = typeof payableAccounts.$inferInsert;

export const payablePayments = pgTable("payable_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  payableId: uuid("payable_id")
    .notNull()
    .references(() => payableAccounts.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
  destination: text("destination"),
  paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
});

export type PayablePayment = typeof payablePayments.$inferSelect;
export type NewPayablePayment = typeof payablePayments.$inferInsert;
