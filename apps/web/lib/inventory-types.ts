export type ProductUnit = "unit" | "meter" | "kg" | "liter" | "set";

export const PRODUCT_UNITS: ProductUnit[] = ["unit", "meter", "kg", "liter", "set"];

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  unit: "Unidad",
  meter: "Metro",
  kg: "Kilogramo",
  liter: "Litro",
  set: "Set",
};

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductSubcategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string | null;
  subcategoryId: string | null;
  unit: ProductUnit;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number | null;
  location: string;
  netWeight: number | null;
  grossWeight: number | null;
  isActive: boolean;
}

export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  stockBefore: number;
  newStock: number;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}
