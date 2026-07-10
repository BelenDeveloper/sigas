import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { PackagePlus, Pencil } from "lucide-react";

import { formatCurrencyBOB } from "@/lib/format-currency";
import {
  PRODUCT_UNIT_LABELS,
  type Category,
  type Product,
  type Subcategory,
} from "@/lib/mocks/inventory.mock";

import { LowStockBadge } from "./LowStockBadge";

const ACTIVE_LABEL = "Activo";
const INACTIVE_LABEL = "Inactivo";
const NO_PRODUCTS_MESSAGE = "No se encontraron productos con estos filtros.";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
}

export function ProductTable({
  products,
  categories,
  subcategories,
  onEdit,
  onAdjustStock,
}: ProductTableProps) {
  const getCategoryName = (categoryId: string) =>
    categories.find((category) => category.id === categoryId)?.name ?? categoryId;

  const getSubcategoryName = (subcategoryId: string) =>
    subcategories.find((subcategory) => subcategory.id === subcategoryId)?.name ?? subcategoryId;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Unidad</TableHead>
          <TableHead>Stock actual</TableHead>
          <TableHead>Stock mínimo</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground">
              {NO_PRODUCTS_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => {
            const isLowStock = product.currentStock <= product.minimumStock;

            return (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{getCategoryName(product.categoryId)}</span>
                    <span className="text-xs text-muted-foreground">
                      {getSubcategoryName(product.subcategoryId)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{PRODUCT_UNIT_LABELS[product.unit]}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{product.currentStock}</span>
                    {isLowStock ? <LowStockBadge /> : null}
                  </div>
                </TableCell>
                <TableCell>{product.minimumStock}</TableCell>
                <TableCell>{formatCurrencyBOB(product.salePriceBOB)}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "secondary" : "outline"}>
                    {product.isActive ? ACTIVE_LABEL : INACTIVE_LABEL}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar producto"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ajustar stock"
                      onClick={() => onAdjustStock(product)}
                    >
                      <PackagePlus className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
