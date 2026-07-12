import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const CLIENT_DOCUMENT_TYPES = ["CI", "NIT", "passport"] as const;
export type ClientDocumentType = (typeof CLIENT_DOCUMENT_TYPES)[number];

const DEFAULT_CLIENT_CITY = "Cochabamba";

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    documentType: text("document_type", { enum: CLIENT_DOCUMENT_TYPES }),
    documentNumber: text("document_number"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    neighborhood: text("neighborhood"),
    city: text("city").notNull().default(DEFAULT_CLIENT_CITY),
    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("clients_name_idx").on(table.name),
    index("clients_document_number_idx").on(table.documentNumber),
  ],
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
