import {
  boolean,
  index,
  numeric,
  pgSequence,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const productSkuSequence = pgSequence("product_sku_seq", {
  startWith: 1,
  increment: 1,
});

export const PRODUCT_UNITS = ["unit", "meter", "kg", "liter", "set"] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const STOCK_MOVEMENT_TYPES = ["IN", "OUT", "ADJUSTMENT"] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export const STOCK_MOVEMENT_REFERENCE_TYPES = ["sale", "purchase", "adjustment", "migration"] as const;
export type StockMovementReferenceType = (typeof STOCK_MOVEMENT_REFERENCE_TYPES)[number];

export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;

export const productSubcategories = pgTable(
  "product_subcategories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => productCategories.id),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [unique().on(table.categoryId, table.name)],
);

export type ProductSubcategory = typeof productSubcategories.$inferSelect;
export type NewProductSubcategory = typeof productSubcategories.$inferInsert;

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    categoryId: uuid("category_id").references(() => productCategories.id),
    subcategoryId: uuid("subcategory_id").references(() => productSubcategories.id),
    unit: text("unit", { enum: PRODUCT_UNITS }).notNull().default("unit"),
    costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
    salePrice: numeric("sale_price", { precision: 12, scale: 2 }).notNull().default("0"),
    currentStock: numeric("current_stock", { precision: 12, scale: 3 }).notNull().default("0"),
    reservedStock: numeric("reserved_stock", { precision: 12, scale: 3 }).notNull().default("0"),
    minimumStock: numeric("minimum_stock", { precision: 12, scale: 3 }).notNull().default("0"),
    maximumStock: numeric("maximum_stock", { precision: 12, scale: 3 }),
    location: text("location"),
    netWeight: numeric("net_weight", { precision: 10, scale: 3 }),
    grossWeight: numeric("gross_weight", { precision: 10, scale: 3 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => [index("products_category_id_idx").on(table.categoryId)],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    type: text("type", { enum: STOCK_MOVEMENT_TYPES }).notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
    stockBefore: numeric("stock_before", { precision: 12, scale: 3 }).notNull(),
    newStock: numeric("new_stock", { precision: 12, scale: 3 }).notNull(),
    reason: text("reason"),
    referenceId: uuid("reference_id"),
    referenceType: text("reference_type", { enum: STOCK_MOVEMENT_REFERENCE_TYPES }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("stock_movements_product_id_idx").on(table.productId),
    index("stock_movements_created_at_idx").on(table.createdAt),
  ],
);

export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
