"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

import type { SaleItemInput } from "@/hooks/use-sales";
import { formatCurrencyBOB } from "@/lib/format-currency";
import type { Product } from "@/lib/inventory-types";

const SELECT_PRODUCT_PLACEHOLDER = "Selecciona un producto";
const NO_ITEMS_MESSAGE = "Todavía no agregaste productos.";
const MINIMUM_QUANTITY = 1;

const EMPTY_ITEM: SaleItemInput = {
  productId: "",
  productName: "",
  quantity: MINIMUM_QUANTITY,
  unitPriceBOB: 0,
};

interface SaleItemsEditorProps {
  items: SaleItemInput[];
  onItemsChange: (items: SaleItemInput[]) => void;
  products: Product[];
}

export function SaleItemsEditor({ items, onItemsChange, products }: SaleItemsEditorProps) {
  const runningTotalBOB = items.reduce((sum, item) => sum + item.quantity * item.unitPriceBOB, 0);

  const handleAddItem = () => {
    onItemsChange([...items, { ...EMPTY_ITEM }]);
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((candidate) => candidate.id === productId);

    onItemsChange(
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              productId,
              productName: product?.name ?? "",
              unitPriceBOB: product?.salePrice ?? item.unitPriceBOB,
            }
          : item,
      ),
    );
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    onItemsChange(
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, quantity } : item)),
    );
  };

  const handleUnitPriceChange = (index: number, unitPriceBOB: number) => {
    onItemsChange(
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, unitPriceBOB } : item)),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio unitario</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const subtotalBOB = item.quantity * item.unitPriceBOB;

              return (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => handleProductChange(index, value ?? "")}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue>
                          {() =>
                            products.find((product) => product.id === item.productId)?.name ??
                            SELECT_PRODUCT_PLACEHOLDER
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={MINIMUM_QUANTITY}
                      className="w-20"
                      value={item.quantity}
                      onChange={(event) => handleQuantityChange(index, Number(event.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-28"
                      value={item.unitPriceBOB}
                      onChange={(event) =>
                        handleUnitPriceChange(index, Number(event.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>{formatCurrencyBOB(subtotalBOB)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Quitar producto"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">{NO_ITEMS_MESSAGE}</p>
      )}

      <Button variant="outline" onClick={handleAddItem} className="w-fit">
        <Plus className="size-4" />
        Agregar producto
      </Button>

      <p className="text-right text-sm font-semibold text-foreground">
        Total: {formatCurrencyBOB(runningTotalBOB)}
      </p>
    </div>
  );
}
