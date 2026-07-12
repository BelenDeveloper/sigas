import type { Product, ProductCategory, ProductSubcategory, ProductUnit, StockMovement, StockMovementType } from "@repo/db";

export type { Product, ProductCategory, ProductSubcategory, StockMovement };

export interface ProductWithRelations extends Product {
  category: ProductCategory | null;
  subcategory: ProductSubcategory | null;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  showInactive?: boolean;
}

export interface MovementFilters {
  productId?: string;
  type?: StockMovementType;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CreateProductInput {
  sku?: string;
  name: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  unit: ProductUnit;
  costPrice: number;
  salePrice: number;
  minimumStock?: number;
  maximumStock?: number;
  location?: string;
  netWeight?: number;
  grossWeight?: number;
}

export interface UpdateProductInput {
  name: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  unit: ProductUnit;
  costPrice: number;
  salePrice: number;
  minimumStock?: number;
  maximumStock?: number;
  location?: string;
  netWeight?: number;
  grossWeight?: number;
  isActive: boolean;
}

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = "ProductNotFoundError";
  }
}

export class InsufficientStockError extends Error {
  constructor(productId: string) {
    super(`Insufficient stock for product: ${productId}`);
    this.name = "InsufficientStockError";
  }
}
