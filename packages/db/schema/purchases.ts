import { date, index, numeric, pgSequence, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { companies } from "./companies.js";
import { products } from "./inventory.js";
import { PAYMENT_METHODS } from "./sales.js";
import { suppliers } from "./suppliers.js";
import { users } from "./users.js";

export const PURCHASE_STATUSES = ["pending", "partial", "paid"] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const PURCHASE_CODE_SEQUENCE_NAME = "purchase_code_seq";

export const purchaseCodeSeq = pgSequence(PURCHASE_CODE_SEQUENCE_NAME, {
  startWith: 1,
  increment: 1,
});

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    status: text("status", { enum: PURCHASE_STATUSES }).notNull().default("pending"),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    companyId: uuid("company_id").references(() => companies.id),
    invoiceNumber: text("invoice_number"),
    purchaseDate: date("purchase_date").notNull().default(sql`CURRENT_DATE`),
    notes: text("notes"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("purchases_supplier_id_idx").on(table.supplierId),
    index("purchases_status_idx").on(table.status),
    index("purchases_purchase_date_idx").on(table.purchaseDate),
  ],
);

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;

export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    purchaseId: uuid("purchase_id")
      .notNull()
      .references(() => purchases.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
    unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
  },
  (table) => [index("purchase_items_purchase_id_idx").on(table.purchaseId)],
);

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type NewPurchaseItem = typeof purchaseItems.$inferInsert;

export const purchasePayments = pgTable(
  "purchase_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    purchaseId: uuid("purchase_id")
      .notNull()
      .references(() => purchases.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
    accountDestination: text("account_destination"),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => [index("purchase_payments_purchase_id_idx").on(table.purchaseId)],
);

export type PurchasePayment = typeof purchasePayments.$inferSelect;
export type NewPurchasePayment = typeof purchasePayments.$inferInsert;
