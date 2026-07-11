import { boolean, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export const companyUserAccess = pgTable(
  "company_user_access",
  {
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    canView: boolean("can_view").notNull().default(true),
    canEdit: boolean("can_edit").notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.companyId, table.userId] })],
);

export type CompanyUserAccess = typeof companyUserAccess.$inferSelect;
export type NewCompanyUserAccess = typeof companyUserAccess.$inferInsert;
