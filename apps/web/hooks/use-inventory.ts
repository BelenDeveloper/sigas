"use client";

import { useMemo, useState } from "react";

import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_STOCK_MOVEMENTS,
  MOCK_SUBCATEGORIES,
  type Category,
  type Product,
  type ProductUnit,
  type StockMovement,
  type StockMovementType,
  type Subcategory,
} from "@/lib/mocks/inventory.mock";

export const ALL_CATEGORIES_OPTION_ID = "all";
export const ALL_SUBCATEGORIES_OPTION_ID = "all";
export const ALL_MOVEMENT_TYPES_OPTION = "all";

export interface ProductFilterState {
  searchTerm: string;
  categoryId: string;
  subcategoryId: string;
  showInactive: boolean;
}

export interface StockMovementFilterState {
  searchTerm: string;
  movementType: StockMovementType | typeof ALL_MOVEMENT_TYPES_OPTION;
  dateFrom: string;
  dateTo: string;
}

export interface ProductInput {
  sku: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  unit: ProductUnit;
  minimumStock: number;
  maximumStock: number;
  costPriceBOB: number;
  salePriceBOB: number;
  location: string;
  netWeightKg: number;
  grossWeightKg: number;
  description: string;
}

const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
  searchTerm: "",
  categoryId: ALL_CATEGORIES_OPTION_ID,
  subcategoryId: ALL_SUBCATEGORIES_OPTION_ID,
  showInactive: false,
};

const DEFAULT_STOCK_MOVEMENT_FILTERS: StockMovementFilterState = {
  searchTerm: "",
  movementType: ALL_MOVEMENT_TYPES_OPTION,
  dateFrom: "",
  dateTo: "",
};

function nextSequence(existingSkus: string[], prefix: string): string {
  const matchingNumbers = existingSkus
    .filter((sku) => sku.startsWith(prefix))
    .map((sku) => Number(sku.slice(prefix.length)))
    .filter((value) => !Number.isNaN(value));

  const nextNumber = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) + 1 : 1;

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

interface UseInventoryResult {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  allProducts: Product[];
  productFilters: ProductFilterState;
  setProductFilters: (filters: Partial<ProductFilterState>) => void;
  stockMovements: StockMovement[];
  stockMovementFilters: StockMovementFilterState;
  setStockMovementFilters: (filters: Partial<StockMovementFilterState>) => void;
  createProduct: (input: ProductInput) => void;
  updateProduct: (productId: string, input: ProductInput) => void;
  adjustStock: (productId: string, quantityDelta: number, reason: string) => void;
  suggestSku: (categoryId: string, subcategoryId: string) => string;
  getProductById: (productId: string) => Product | undefined;
}

export function useInventory(): UseInventoryResult {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(MOCK_STOCK_MOVEMENTS);
  const [productFilters, setProductFiltersState] =
    useState<ProductFilterState>(DEFAULT_PRODUCT_FILTERS);
  const [stockMovementFilters, setStockMovementFiltersState] = useState<StockMovementFilterState>(
    DEFAULT_STOCK_MOVEMENT_FILTERS,
  );

  const setProductFilters = (filters: Partial<ProductFilterState>) => {
    setProductFiltersState((previous) => ({ ...previous, ...filters }));
  };

  const setStockMovementFilters = (filters: Partial<StockMovementFilterState>) => {
    setStockMovementFiltersState((previous) => ({ ...previous, ...filters }));
  };

  const getProductById = (productId: string) => products.find((product) => product.id === productId);

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = productFilters.searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      if (!productFilters.showInactive && !product.isActive) {
        return false;
      }

      if (
        productFilters.categoryId !== ALL_CATEGORIES_OPTION_ID &&
        product.categoryId !== productFilters.categoryId
      ) {
        return false;
      }

      if (
        productFilters.subcategoryId !== ALL_SUBCATEGORIES_OPTION_ID &&
        product.subcategoryId !== productFilters.subcategoryId
      ) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(normalizedSearchTerm) ||
        product.sku.toLowerCase().includes(normalizedSearchTerm)
      );
    });
  }, [products, productFilters]);

  const filteredStockMovements = useMemo(() => {
    const normalizedSearchTerm = stockMovementFilters.searchTerm.trim().toLowerCase();

    return stockMovements.filter((movement) => {
      if (
        stockMovementFilters.movementType !== ALL_MOVEMENT_TYPES_OPTION &&
        movement.type !== stockMovementFilters.movementType
      ) {
        return false;
      }

      if (stockMovementFilters.dateFrom && movement.date < stockMovementFilters.dateFrom) {
        return false;
      }

      if (stockMovementFilters.dateTo && movement.date > stockMovementFilters.dateTo) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const product = products.find((item) => item.id === movement.productId);
      return product ? product.name.toLowerCase().includes(normalizedSearchTerm) : false;
    });
  }, [stockMovements, stockMovementFilters, products]);

  const createProduct = (input: ProductInput) => {
    const newProduct: Product = {
      ...input,
      id: crypto.randomUUID(),
      currentStock: 0,
      isActive: true,
    };

    setProducts((previous) => [...previous, newProduct]);
  };

  const updateProduct = (productId: string, input: ProductInput) => {
    setProducts((previous) =>
      previous.map((product) => (product.id === productId ? { ...product, ...input } : product)),
    );
  };

  const adjustStock = (productId: string, quantityDelta: number, reason: string) => {
    const product = getProductById(productId);
    if (!product) {
      return;
    }

    const stockBefore = product.currentStock;
    const stockAfter = stockBefore + quantityDelta;
    const movementType: StockMovementType = quantityDelta >= 0 ? "IN" : "OUT";

    setProducts((previous) =>
      previous.map((item) => (item.id === productId ? { ...item, currentStock: stockAfter } : item)),
    );

    const newMovement: StockMovement = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      productId,
      type: movementType,
      quantity: quantityDelta,
      stockBefore,
      stockAfter,
      reason,
      createdBy: "Tú",
    };

    setStockMovements((previous) => [newMovement, ...previous]);
  };

  const suggestSku = (categoryId: string, subcategoryId: string): string => {
    const category = MOCK_CATEGORIES.find((item) => item.id === categoryId);
    const subcategory = MOCK_SUBCATEGORIES.find((item) => item.id === subcategoryId);

    if (!category || !subcategory) {
      return "";
    }

    const prefix = `${category.name.slice(0, 3).toUpperCase()}-${subcategory.name.slice(0, 3).toUpperCase()}-`;

    return nextSequence(
      products.map((product) => product.sku),
      prefix,
    );
  };

  return {
    categories: MOCK_CATEGORIES,
    subcategories: MOCK_SUBCATEGORIES,
    products: filteredProducts,
    allProducts: products,
    productFilters,
    setProductFilters,
    stockMovements: filteredStockMovements,
    stockMovementFilters,
    setStockMovementFilters,
    createProduct,
    updateProduct,
    adjustStock,
    suggestSku,
    getProductById,
  };
}
