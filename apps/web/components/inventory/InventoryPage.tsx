"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useInventory } from "@/hooks/use-inventory";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import type { Product } from "@/lib/inventory-types";
import { hasModulePermission } from "@/lib/permission-helpers";

import { AdjustStockDialog } from "./AdjustStockDialog";
import { ProductFilters } from "./ProductFilters";
import { ProductFormDialog } from "./ProductFormDialog";
import { ProductTable } from "./ProductTable";
import { StockMovementFilters } from "./StockMovementFilters";
import { StockMovementTable } from "./StockMovementTable";

const INVENTORY_MODULE = "inventory";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";

export function InventoryPage() {
  const authUser = useAtomValue(authUserAtom);
  const canViewInventory = hasModulePermission(authUser, INVENTORY_MODULE, "canView");
  const canCreateProduct = hasModulePermission(authUser, INVENTORY_MODULE, "canCreate");

  const {
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
    isLoading,
    isMovementsLoading,
    isCreating,
    isUpdating,
    isAdjustingStock,
  } = useInventory();

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustStockOpen, setAdjustStockOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  if (!canViewInventory) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  const handleNewProduct = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleAdjustStock = (product: Product) => {
    setAdjustingProduct(product);
    setAdjustStockOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="movements">Movimientos de stock</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <ProductFilters
              filters={productFilters}
              onFiltersChange={setProductFilters}
              categories={categories}
              subcategories={subcategories}
            />
            {canCreateProduct ? (
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={handleNewProduct}
              >
                <Plus className="size-4" />
                Nuevo producto
              </Button>
            ) : null}
          </div>

          <ProductTable
            products={products}
            isLoading={isLoading}
            categories={categories}
            subcategories={subcategories}
            onEdit={handleEditProduct}
            onAdjustStock={handleAdjustStock}
          />
        </TabsContent>

        <TabsContent value="movements" className="flex flex-col gap-4">
          <StockMovementFilters
            filters={stockMovementFilters}
            onFiltersChange={setStockMovementFilters}
          />
          <StockMovementTable movements={stockMovements} isLoading={isMovementsLoading} />
        </TabsContent>
      </Tabs>

      <ProductFormDialog
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        product={editingProduct}
        categories={categories}
        subcategories={subcategories}
        isCreating={isCreating}
        isUpdating={isUpdating}
        onCreate={createProduct}
        onUpdate={updateProduct}
      />

      <AdjustStockDialog
        product={adjustingProduct}
        open={adjustStockOpen}
        onOpenChange={setAdjustStockOpen}
        isSaving={isAdjustingStock}
        onConfirm={adjustStock}
      />
    </div>
  );
}
