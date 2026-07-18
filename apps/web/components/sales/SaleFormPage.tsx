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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useClients } from "@/hooks/use-clients";
import { useInventory } from "@/hooks/use-inventory";
import { useSales, type SaleItemInput, type SalePaymentInput } from "@/hooks/use-sales";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { hasModulePermission } from "@/lib/permission-helpers";
import { SALE_TYPES, SALE_TYPE_LABELS, type SaleType } from "@/lib/sale-types";

import { SaleItemsEditor } from "./SaleItemsEditor";
import { SalePaymentSection } from "./SalePaymentSection";

const SALES_MODULE = "sales";
const DEFAULT_SALE_TYPE: SaleType = "quotation";
const SELECT_CLIENT_PLACEHOLDER = "Selecciona un cliente";
const CLIENT_REQUIRED_MESSAGE = "Selecciona un cliente antes de continuar.";
const ITEMS_REQUIRED_MESSAGE = "Agrega al menos un producto con cantidad válida.";
const CREATE_ERROR_MESSAGE = "No se pudo crear la venta. Intenta nuevamente.";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para crear ventas.";

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SaleFormPage() {
  const router = useRouter();
  const authUser = useAtomValue(authUserAtom);
  const canCreateSale = hasModulePermission(authUser, SALES_MODULE, "canCreate");

  const { clients } = useClients();
  const { products } = useInventory();
  const { createSale } = useSales();

  const [clientId, setClientId] = useState("");
  const [type, setType] = useState<SaleType>(DEFAULT_SALE_TYPE);
  const [date, setDate] = useState(todayISODate());
  const [notes, setNotes] = useState("");
  const [discountBOB, setDiscountBOB] = useState(0);
  const [items, setItems] = useState<SaleItemInput[]>([]);
  const [payments, setPayments] = useState<SalePaymentInput[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!canCreateSale) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  const subtotalBOB = items.reduce((sum, item) => sum + item.quantity * item.unitPriceBOB, 0);
  const totalBOB = subtotalBOB - discountBOB;

  const handleSave = async () => {
    if (!clientId) {
      setErrorMessage(CLIENT_REQUIRED_MESSAGE);
      return;
    }

    const hasValidItems = items.length > 0 && items.every((item) => item.productId && item.quantity > 0);

    if (!hasValidItems) {
      setErrorMessage(ITEMS_REQUIRED_MESSAGE);
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const createdSale = await createSale({
        clientId,
        type,
        date,
        notes,
        discountBOB,
        items,
        payments: type === "sale" ? payments : [],
      });

      router.push(`/sales/${createdSale.id}`);
    } catch {
      setErrorMessage(CREATE_ERROR_MESSAGE);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de la venta</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sale-form-client">Cliente</Label>
            <Select value={clientId} onValueChange={(value) => setClientId(value ?? "")}>
              <SelectTrigger id="sale-form-client">
                <SelectValue>
                  {() => clients.find((client) => client.id === clientId)?.name ?? SELECT_CLIENT_PLACEHOLDER}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sale-form-type">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType((value ?? DEFAULT_SALE_TYPE) as SaleType)}>
              <SelectTrigger id="sale-form-type">
                <SelectValue>{() => SALE_TYPE_LABELS[type]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SALE_TYPES.map((saleType) => (
                  <SelectItem key={saleType} value={saleType}>
                    {SALE_TYPE_LABELS[saleType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sale-form-date">Fecha</Label>
            <Input
              id="sale-form-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sale-form-discount">Descuento (Bs.)</Label>
            <Input
              id="sale-form-discount"
              type="number"
              step="0.01"
              min={0}
              value={discountBOB}
              onChange={(event) => setDiscountBOB(Number(event.target.value))}
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="sale-form-notes">Notas</Label>
            <Textarea
              id="sale-form-notes"
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
          <SaleItemsEditor items={items} onItemsChange={setItems} products={products} />
        </CardContent>
      </Card>

      {type === "sale" ? (
        <Card>
          <CardHeader>
            <CardTitle>Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <SalePaymentSection
              payments={payments}
              onPaymentsChange={setPayments}
              totalBOB={totalBOB}
            />
          </CardContent>
        </Card>
      ) : null}

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Crear venta"}
        </Button>
      </div>
    </div>
  );
}
