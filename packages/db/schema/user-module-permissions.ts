import { boolean, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const MODULES = [
  "inventory",
  "clients",
  "suppliers",
  "sales",
  "purchases",
  "cash",
  "projects",
  "notifications",
  "settings",
  "companies",
  "users",
] as const;
export type ModuleKey = (typeof MODULES)[number];

export const userModulePermissions = pgTable(
  "user_module_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    module: text("module", { enum: MODULES }).notNull(),
    canView: boolean("can_view").notNull().default(false),
    canCreate: boolean("can_create").notNull().default(false),
    canEdit: boolean("can_edit").notNull().default(false),
  },
  (table) => [unique().on(table.userId, table.module)],
);

export type UserModulePermission = typeof userModulePermissions.$inferSelect;
export type NewUserModulePermission = typeof userModulePermissions.$inferInsert;
