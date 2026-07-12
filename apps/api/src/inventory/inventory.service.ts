import { Injectable } from "@nestjs/common";
import {
  db,
  schema,
  type Product,
  type ProductCategory,
  type ProductSubcategory,
  type StockMovement,
  type StockMovementReferenceType,
} from "@repo/db";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

import {
  InsufficientStockError,
  ProductNotFoundError,
  type CreateProductInput,
  type MovementFilters,
  type ProductFilters,
  type ProductWithRelations,
  type UpdateProductInput,
} from "./inventory.types.js";

const SKU_PREFIX = "PROD-";
const SKU_PADDING_LENGTH = 3;

@Injectable()
export class InventoryService {
  async findProducts(filters: ProductFilters): Promise<Product[]> {
    const conditions = [];

    if (!filters.showInactive) {
      conditions.push(eq(schema.products.isActive, true));
    }

    if (filters.categoryId) {
      conditions.push(eq(schema.products.categoryId, filters.categoryId));
    }

    if (filters.subcategoryId) {
      conditions.push(eq(schema.products.subcategoryId, filters.subcategoryId));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(ilike(schema.products.name, searchPattern), ilike(schema.products.sku, searchPattern)),
      );
    }

    const query = db.select().from(schema.products).orderBy(schema.products.name);

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  }

  async findProductById(id: string): Promise<ProductWithRelations> {
    const [row] = await db
      .select({
        product: schema.products,
        category: schema.productCategories,
        subcategory: schema.productSubcategories,
      })
      .from(schema.products)
      .leftJoin(schema.productCategories, eq(schema.products.categoryId, schema.productCategories.id))
      .leftJoin(
        schema.productSubcategories,
        eq(schema.products.subcategoryId, schema.productSubcategories.id),
      )
      .where(eq(schema.products.id, id))
      .limit(1);

    if (!row) {
      throw new ProductNotFoundError(id);
    }

    return { ...row.product, category: row.category, subcategory: row.subcategory };
  }

  async createProduct(input: CreateProductInput, updatedBy: string): Promise<Product> {
    const sku = input.sku ?? (await this.generateNextSku());

    const [product] = await db
      .insert(schema.products)
      .values({
        sku,
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        unit: input.unit,
        costPrice: input.costPrice.toString(),
        salePrice: input.salePrice.toString(),
        minimumStock: input.minimumStock?.toString(),
        maximumStock: input.maximumStock?.toString(),
        location: input.location,
        netWeight: input.netWeight?.toString(),
        grossWeight: input.grossWeight?.toString(),
        updatedBy,
      })
      .returning();

    if (!product) {
      throw new Error(`Failed to create product: ${input.name}`);
    }

    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput, updatedBy: string): Promise<Product> {
    const [updatedProduct] = await db
      .update(schema.products)
      .set({
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        unit: input.unit,
        costPrice: input.costPrice.toString(),
        salePrice: input.salePrice.toString(),
        minimumStock: input.minimumStock?.toString(),
        maximumStock: input.maximumStock?.toString(),
        location: input.location,
        netWeight: input.netWeight?.toString(),
        grossWeight: input.grossWeight?.toString(),
        isActive: input.isActive,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.products.id, id))
      .returning();

    if (!updatedProduct) {
      throw new ProductNotFoundError(id);
    }

    return updatedProduct;
  }

  async adjustStock(
    productId: string,
    quantity: number,
    reason: string | undefined,
    userId: string,
    reference?: { id: string; type: StockMovementReferenceType },
  ): Promise<Product> {
    return db.transaction(async (tx) => {
      const [product] = await tx
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, productId))
        .limit(1);

      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      const stockBefore = Number(product.currentStock);
      const newStock = stockBefore + quantity;

      if (newStock < 0) {
        throw new InsufficientStockError(productId);
      }

      const [updatedProduct] = await tx
        .update(schema.products)
        .set({ currentStock: newStock.toString(), updatedAt: new Date() })
        .where(eq(schema.products.id, productId))
        .returning();

      if (!updatedProduct) {
        throw new Error(`Failed to update stock for product: ${productId}`);
      }

      await tx.insert(schema.stockMovements).values({
        productId,
        type: quantity >= 0 ? "IN" : "OUT",
        quantity: quantity.toString(),
        stockBefore: stockBefore.toString(),
        newStock: newStock.toString(),
        reason,
        referenceId: reference?.id,
        referenceType: reference?.type,
        createdBy: userId,
      });

      return updatedProduct;
    });
  }

  async findMovements(filters: MovementFilters): Promise<StockMovement[]> {
    const conditions = [];

    if (filters.productId) {
      conditions.push(eq(schema.stockMovements.productId, filters.productId));
    }

    if (filters.type) {
      conditions.push(eq(schema.stockMovements.type, filters.type));
    }

    if (filters.dateFrom) {
      conditions.push(gte(schema.stockMovements.createdAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(schema.stockMovements.createdAt, filters.dateTo));
    }

    const query = db.select().from(schema.stockMovements).orderBy(desc(schema.stockMovements.createdAt));

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return db
      .select()
      .from(schema.products)
      .where(
        and(eq(schema.products.isActive, true), lte(schema.products.currentStock, schema.products.minimumStock)),
      );
  }

  async findCategories(): Promise<ProductCategory[]> {
    return db.select().from(schema.productCategories).orderBy(asc(schema.productCategories.name));
  }

  async findSubcategories(categoryId?: string): Promise<ProductSubcategory[]> {
    const query = db
      .select()
      .from(schema.productSubcategories)
      .orderBy(asc(schema.productSubcategories.name));

    return categoryId
      ? query.where(eq(schema.productSubcategories.categoryId, categoryId))
      : query;
  }

  async generateNextSku(): Promise<string> {
    const result = await db.execute<{ nextval: string }>(sql`SELECT nextval('product_sku_seq') AS nextval`);
    const nextValue = result.rows[0]?.nextval;

    if (!nextValue) {
      throw new Error("Failed to generate next SKU sequence value");
    }

    return `${SKU_PREFIX}${nextValue.padStart(SKU_PADDING_LENGTH, "0")}`;
  }
}
