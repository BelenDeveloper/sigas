"use client";

import { useMemo, useState } from "react";

import {
  type Product,
  type ProductCategory,
  type ProductSubcategory,
  type ProductUnit,
  type StockMovement,
  type StockMovementType,
} from "@/lib/inventory-types";
import { trpc } from "@/lib/trpc/client";

import { useUsers } from "./use-users";

export const ALL_CATEGORIES_OPTION_ID = "all";
export const ALL_SUBCATEGORIES_OPTION_ID = "all";
export const ALL_MOVEMENT_TYPES_OPTION = "all";

const UNKNOWN_USER_LABEL = "Usuario desconocido";

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
  sku?: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  unit: ProductUnit;
  minimumStock: number;
  maximumStock: number;
  costPrice: number;
  salePrice: number;
  location: string;
  netWeight: number;
  grossWeight: number;
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

interface UseInventoryResult {
  categories: ProductCategory[];
  subcategories: ProductSubcategory[];
  products: Product[];
  productFilters: ProductFilterState;
  setProductFilters: (filters: Partial<ProductFilterState>) => void;
  stockMovements: StockMovement[];
  stockMovementFilters: StockMovementFilterState;
  setStockMovementFilters: (filters: Partial<StockMovementFilterState>) => void;
  createProduct: (input: ProductInput) => void;
  updateProduct: (productId: string, input: ProductInput) => void;
  adjustStock: (productId: string, quantityDelta: number, reason: string) => void;
  isLoading: boolean;
  isMovementsLoading: boolean;
}

function toProductInput(input: ProductInput) {
  return {
    name: input.name,
    description: input.description || undefined,
    categoryId: input.categoryId || undefined,
    subcategoryId: input.subcategoryId || undefined,
    unit: input.unit,
    costPrice: input.costPrice,
    salePrice: input.salePrice,
    minimumStock: input.minimumStock,
    maximumStock: input.maximumStock,
    location: input.location || undefined,
    netWeight: input.netWeight || undefined,
    grossWeight: input.grossWeight || undefined,
  };
}

export function useInventory(): UseInventoryResult {
  const utils = trpc.useUtils();
  const { users } = useUsers();

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

  const { data: rawProducts } = trpc.inventory.listProducts.useQuery({
    search: productFilters.searchTerm || undefined,
    categoryId:
      productFilters.categoryId !== ALL_CATEGORIES_OPTION_ID ? productFilters.categoryId : undefined,
    subcategoryId:
      productFilters.subcategoryId !== ALL_SUBCATEGORIES_OPTION_ID
        ? productFilters.subcategoryId
        : undefined,
    showInactive: productFilters.showInactive,
  });

  const { data: rawAllProducts } = trpc.inventory.listProducts.useQuery({ showInactive: true });
  const { data: rawCategories } = trpc.inventory.listCategories.useQuery();
  const { data: rawSubcategories } = trpc.inventory.listSubcategories.useQuery({});

  const { data: rawMovements } = trpc.inventory.listMovements.useQuery({
    type:
      stockMovementFilters.movementType !== ALL_MOVEMENT_TYPES_OPTION
        ? stockMovementFilters.movementType
        : undefined,
    dateFrom: stockMovementFilters.dateFrom || undefined,
    dateTo: stockMovementFilters.dateTo || undefined,
  });

  const invalidateProducts = () => {
    void utils.inventory.listProducts.invalidate();
    void utils.inventory.getLowStock.invalidate();
  };

  const invalidateAfterStockChange = () => {
    invalidateProducts();
    void utils.inventory.listMovements.invalidate();
  };

  const createMutation = trpc.inventory.createProduct.useMutation({ onSuccess: invalidateProducts });
  const updateMutation = trpc.inventory.updateProduct.useMutation({ onSuccess: invalidateProducts });
  const adjustStockMutation = trpc.inventory.adjustStock.useMutation({
    onSuccess: invalidateAfterStockChange,
  });

  const toProduct = (product: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    categoryId: string | null;
    subcategoryId: string | null;
    unit: ProductUnit;
    costPrice: string;
    salePrice: string;
    currentStock: string;
    minimumStock: string;
    maximumStock: string | null;
    location: string | null;
    netWeight: string | null;
    grossWeight: string | null;
    isActive: boolean;
  }): Product => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description ?? "",
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    unit: product.unit,
    costPrice: Number(product.costPrice),
    salePrice: Number(product.salePrice),
    currentStock: Number(product.currentStock),
    minimumStock: Number(product.minimumStock),
    maximumStock: product.maximumStock !== null ? Number(product.maximumStock) : null,
    location: product.location ?? "",
    netWeight: product.netWeight !== null ? Number(product.netWeight) : null,
    grossWeight: product.grossWeight !== null ? Number(product.grossWeight) : null,
    isActive: product.isActive,
  });

  const products = useMemo(() => (rawProducts ?? []).map(toProduct), [rawProducts]);
  const allProducts = useMemo(() => (rawAllProducts ?? []).map(toProduct), [rawAllProducts]);
  const categories: ProductCategory[] = rawCategories ?? [];
  const subcategories: ProductSubcategory[] = rawSubcategories ?? [];

  const stockMovements = useMemo(() => {
    const userNameById = new Map(users.map((user) => [user.id, user.name]));
    const productNameById = new Map(allProducts.map((product) => [product.id, product.name]));
    const normalizedSearchTerm = stockMovementFilters.searchTerm.trim().toLowerCase();

    return (rawMovements ?? [])
      .map((movement) => ({
        id: movement.id,
        productId: movement.productId,
        productName: productNameById.get(movement.productId) ?? movement.productId,
        type: movement.type,
        quantity: Number(movement.quantity),
        stockBefore: Number(movement.stockBefore),
        newStock: Number(movement.newStock),
        reason: movement.reason ?? "",
        createdBy: movement.createdBy,
        createdByName: userNameById.get(movement.createdBy) ?? UNKNOWN_USER_LABEL,
        createdAt: movement.createdAt,
      }))
      .filter((movement) =>
        normalizedSearchTerm ? movement.productName.toLowerCase().includes(normalizedSearchTerm) : true,
      );
  }, [rawMovements, users, allProducts, stockMovementFilters.searchTerm]);

  const createProduct = (input: ProductInput) => {
    createMutation.mutate(toProductInput(input));
  };

  const updateProduct = (productId: string, input: ProductInput) => {
    const currentProduct = allProducts.find((product) => product.id === productId);

    updateMutation.mutate({
      id: productId,
      ...toProductInput(input),
      isActive: currentProduct?.isActive ?? true,
    });
  };

  const adjustStock = (productId: string, quantityDelta: number, reason: string) => {
    adjustStockMutation.mutate({ productId, quantity: quantityDelta, reason });
  };

  return {
    categories,
    subcategories,
    products,
    productFilters,
    setProductFilters,
    stockMovements,
    stockMovementFilters,
    setStockMovementFilters,
    createProduct,
    updateProduct,
    adjustStock,
    isLoading: rawAllProducts === undefined,
    isMovementsLoading: rawMovements === undefined,
  };
}
