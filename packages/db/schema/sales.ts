import { date, index, numeric, pgSequence, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { clients } from "./clients.js";
import { companies } from "./companies.js";
import { products } from "./inventory.js";
import { users } from "./users.js";

export const SALE_TYPES = ["quotation", "order", "sale", "return"] as const;
export type SaleType = (typeof SALE_TYPES)[number];

export const SALE_STATUSES = ["draft", "confirmed", "partial", "paid", "cancelled"] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "qr", "bank_transfer", "check", "credit_card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const SALE_CODE_SEQUENCE_NAMES: Record<SaleType, string> = {
  quotation: "sale_code_seq_quotation",
  order: "sale_code_seq_order",
  sale: "sale_code_seq_sale",
  return: "sale_code_seq_return",
};

export const saleCodeSeqQuotation = pgSequence(SALE_CODE_SEQUENCE_NAMES.quotation, {
  startWith: 1,
  increment: 1,
});
export const saleCodeSeqOrder = pgSequence(SALE_CODE_SEQUENCE_NAMES.order, {
  startWith: 1,
  increment: 1,
});
export const saleCodeSeqSale = pgSequence(SALE_CODE_SEQUENCE_NAMES.sale, {
  startWith: 1,
  increment: 1,
});
export const saleCodeSeqReturn = pgSequence(SALE_CODE_SEQUENCE_NAMES.return, {
  startWith: 1,
  increment: 1,
});

export const sales = pgTable(
  "sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    type: text("type", { enum: SALE_TYPES }).notNull(),
    status: text("status", { enum: SALE_STATUSES }).notNull().default("draft"),
    clientId: uuid("client_id").references(() => clients.id),
    companyId: uuid("company_id").references(() => companies.id),
    saleDate: date("sale_date").notNull().default(sql`CURRENT_DATE`),
    notes: text("notes"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sales_client_id_idx").on(table.clientId),
    index("sales_status_idx").on(table.status),
    index("sales_sale_date_idx").on(table.saleDate),
  ],
);

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;

export const saleItems = pgTable(
  "sale_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    saleId: uuid("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
  },
  (table) => [index("sale_items_sale_id_idx").on(table.saleId)],
);

export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;

export const salePayments = pgTable(
  "sale_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    saleId: uuid("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
    accountDestination: text("account_destination"),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => [index("sale_payments_sale_id_idx").on(table.saleId)],
);

export type SalePayment = typeof salePayments.$inferSelect;
export type NewSalePayment = typeof salePayments.$inferInsert;
