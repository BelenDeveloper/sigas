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
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useInventory } from "@/hooks/use-inventory";
import { usePurchases, type PurchaseItemInput } from "@/hooks/use-purchases";
import { useSuppliers } from "@/hooks/use-suppliers";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { hasModulePermission } from "@/lib/permission-helpers";

import { PurchaseItemsEditor } from "./PurchaseItemsEditor";

const PURCHASES_MODULE = "purchases";
const SELECT_SUPPLIER_PLACEHOLDER = "Selecciona un proveedor";
const SUPPLIER_REQUIRED_MESSAGE = "Selecciona un proveedor antes de continuar.";
const ITEMS_REQUIRED_MESSAGE = "Agrega al menos un producto con cantidad válida.";
const CREATE_ERROR_MESSAGE = "No se pudo crear la compra. Intenta nuevamente.";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para crear compras.";

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PurchaseFormPage() {
  const router = useRouter();
  const authUser = useAtomValue(authUserAtom);
  const canCreatePurchase = hasModulePermission(authUser, PURCHASES_MODULE, "canCreate");

  const { suppliers } = useSuppliers();
  const { products } = useInventory();
  const { createPurchase } = usePurchases();

  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState(todayISODate());
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseItemInput[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!canCreatePurchase) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  const selectedSupplier = suppliers.find((supplier) => supplier.id === supplierId);
  const hasValidItems = items.length > 0 && items.every((item) => item.productId && item.quantity > 0);

  const handleSave = async () => {
    if (!selectedSupplier) {
      setErrorMessage(SUPPLIER_REQUIRED_MESSAGE);
      return;
    }

    if (!hasValidItems) {
      setErrorMessage(ITEMS_REQUIRED_MESSAGE);
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const createdPurchase = await createPurchase({
        supplierId: selectedSupplier.id,
        date,
        invoiceNumber,
        notes,
        items,
      });

      router.push(`/purchases/${createdPurchase.id}`);
    } catch {
      setErrorMessage(CREATE_ERROR_MESSAGE);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de la compra</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="purchase-form-supplier">Proveedor</Label>
            <Select value={supplierId} onValueChange={(value) => setSupplierId(value ?? "")}>
              <SelectTrigger id="purchase-form-supplier">
                <SelectValue>
                  {() => selectedSupplier?.companyName ?? SELECT_SUPPLIER_PLACEHOLDER}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="purchase-form-date">Fecha</Label>
            <Input
              id="purchase-form-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="purchase-form-invoice">Número de factura (opcional)</Label>
            <Input
              id="purchase-form-invoice"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="purchase-form-notes">Notas</Label>
            <Textarea
              id="purchase-form-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseItemsEditor items={items} onItemsChange={setItems} products={products} />
        </CardContent>
      </Card>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-brand text-brand-foreground hover:bg-brand/90">
          Guardar compra
        </Button>
      </div>
    </div>
  );
}
