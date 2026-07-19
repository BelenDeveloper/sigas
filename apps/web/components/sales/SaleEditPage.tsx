"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useAtomValue } from "jotai";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useInventory } from "@/hooks/use-inventory";
import { useSale, type SaleItemInput } from "@/hooks/use-sales";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { DISCOUNT_TYPES, DISCOUNT_TYPE_LABELS, type DiscountType } from "@/lib/discount-types";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { hasModulePermission } from "@/lib/permission-helpers";

import { DetailPageSkeleton } from "../shared/DetailPageSkeleton";
import { SaleItemsEditor } from "./SaleItemsEditor";

const SALES_MODULE = "sales";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para editar ventas.";
const SALE_NOT_FOUND_MESSAGE = "No se encontró la venta solicitada.";
const CANCELLED_SALE_MESSAGE = "No se puede editar una venta cancelada.";
const ITEMS_REQUIRED_MESSAGE = "Agrega al menos un producto con cantidad válida.";
const EDIT_NOTE_REQUIRED_MESSAGE = "Ingresa una observación explicando el cambio.";
const UPDATE_ERROR_MESSAGE = "No se pudo guardar la venta. Intenta nuevamente.";
const CANCELLED_STATUS = "cancelled";
const DEFAULT_DISCOUNT_MODE: DiscountType = "amount";
const PERCENT_MAX = 100;

function toSaleItemInputs(
  items: { productId: string; productName: string; quantity: number; unitPriceBOB: number }[],
): SaleItemInput[] {
  return items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPriceBOB: item.unitPriceBOB,
  }));
}

interface SaleEditPageProps {
  saleId: string;
}

export function SaleEditPage({ saleId }: SaleEditPageProps) {
  const router = useRouter();
  const authUser = useAtomValue(authUserAtom);
  const canEditSale = hasModulePermission(authUser, SALES_MODULE, "canEdit");

  const { products } = useInventory();
  const { sale, isLoading, updateSale, isUpdatingSale } = useSale(saleId);

  const [items, setItems] = useState<SaleItemInput[] | null>(null);
  const [discountMode, setDiscountMode] = useState<DiscountType>(DEFAULT_DISCOUNT_MODE);
  const [discountValue, setDiscountValue] = useState<number | null>(null);
  const [editNote, setEditNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!canEditSale) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!sale) {
    return <p className="text-muted-foreground">{SALE_NOT_FOUND_MESSAGE}</p>;
  }

  if (sale.status === CANCELLED_STATUS) {
    return <p className="text-muted-foreground">{CANCELLED_SALE_MESSAGE}</p>;
  }

  const currentItems = items ?? toSaleItemInputs(sale.items);
  const currentDiscountValue = discountValue ?? sale.discountBOB;

  const subtotalBOB = currentItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBOB, 0);
  const discountBOB =
    discountMode === "percent" ? subtotalBOB * (currentDiscountValue / PERCENT_MAX) : currentDiscountValue;
  const totalBOB = subtotalBOB - discountBOB;

  const handleSave = async () => {
    const hasValidItems =
      currentItems.length > 0 && currentItems.every((item) => item.productId && item.quantity > 0);

    if (!hasValidItems) {
      setErrorMessage(ITEMS_REQUIRED_MESSAGE);
      return;
    }

    if (!editNote.trim()) {
      setErrorMessage(EDIT_NOTE_REQUIRED_MESSAGE);
      return;
    }

    setErrorMessage(null);

    try {
      await updateSale({ discountBOB, items: currentItems, editNote });
      router.push(`/sales/${saleId}`);
    } catch {
      setErrorMessage(UPDATE_ERROR_MESSAGE);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={`/sales/${saleId}`} />}
        className="w-fit"
      >
        <ArrowLeft className="size-4" />
        Volver a la venta
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar {sale.code}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sale-edit-discount">Descuento</Label>
            <div className="flex gap-2">
              <Input
                id="sale-edit-discount"
                type="number"
                step="0.01"
                min={0}
                max={discountMode === "percent" ? PERCENT_MAX : undefined}
                value={currentDiscountValue}
                onChange={(event) => setDiscountValue(Number(event.target.value))}
              />
              <Select
                value={discountMode}
                onValueChange={(value) => setDiscountMode((value ?? DEFAULT_DISCOUNT_MODE) as DiscountType)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue>{() => DISCOUNT_TYPE_LABELS[discountMode]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DISCOUNT_TYPES.map((discountType) => (
                    <SelectItem key={discountType} value={discountType}>
                      {DISCOUNT_TYPE_LABELS[discountType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <SaleItemsEditor items={currentItems} onItemsChange={setItems} products={products} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observación</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="sale-edit-note">Motivo del cambio (obligatorio)</Label>
          <Textarea
            id="sale-edit-note"
            rows={3}
            value={editNote}
            onChange={(event) => setEditNote(event.target.value)}
          />
        </CardContent>
      </Card>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end gap-3">
        <span className="self-center text-sm text-muted-foreground">
          Total: {formatCurrencyBOB(totalBOB)}
        </span>
        <Button
          onClick={handleSave}
          disabled={isUpdatingSale}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {isUpdatingSale ? <Loader2 className="size-4 animate-spin" /> : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
