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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { usePurchases, type PurchasePaymentInput } from "@/hooks/use-purchases";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";
import {
  getPurchasePaidBOB,
  getPurchasePendingBOB,
  getPurchaseStatus,
  getPurchaseTotalBOB,
} from "@/lib/purchase-helpers";

import { PurchaseStatusBadge } from "./PurchaseStatusBadge";

const PURCHASE_NOT_FOUND_MESSAGE = "No se encontró la compra solicitada.";
const PURCHASES_ROUTE = "/purchases";
const DATE_LOCALE = "es-BO";
const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];
const DEFAULT_PAYMENT_METHOD: PaymentMethod = "cash";
const EMPTY_PAYMENT: PurchasePaymentInput = {
  amountBOB: 0,
  method: DEFAULT_PAYMENT_METHOD,
  accountDestination: "",
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface PurchaseDetailPageProps {
  purchaseId: string;
}

export function PurchaseDetailPage({ purchaseId }: PurchaseDetailPageProps) {
  const { getPurchaseById, addPayment } = usePurchases();
  const purchase = getPurchaseById(purchaseId);

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<PurchasePaymentInput>(EMPTY_PAYMENT);

  if (!purchase) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{PURCHASE_NOT_FOUND_MESSAGE}</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={PURCHASES_ROUTE} />}
          className="w-fit"
        >
          <ArrowLeft className="size-4" />
          Volver a compras
        </Button>
      </div>
    );
  }

  const totalBOB = getPurchaseTotalBOB(purchase);
  const paidBOB = getPurchasePaidBOB(purchase);
  const pendingBOB = getPurchasePendingBOB(purchase);
  const status = getPurchaseStatus(purchase);

  const handleConfirmPayment = () => {
    addPayment(purchase.id, newPayment);
    setNewPayment(EMPTY_PAYMENT);
    setIsAddingPayment(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={PURCHASES_ROUTE} />}
        className="w-fit"
      >
        <ArrowLeft className="size-4" />
        Volver a compras
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{purchase.code}</CardTitle>
            <p className="text-sm text-muted-foreground">{purchase.supplierName}</p>
          </div>
          <PurchaseStatusBadge status={status} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Fecha</span>
            <span className="text-sm text-foreground">{formatDate(purchase.date)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Número de factura</span>
            <span className="text-sm text-foreground">{purchase.invoiceNumber || "—"}</span>
          </div>
          <div className="flex flex-col sm:col-span-2">
            <span className="text-xs text-muted-foreground">Notas</span>
            <span className="text-sm text-foreground">{purchase.notes || "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Costo unitario</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrencyBOB(item.unitCostBOB)}</TableCell>
                  <TableCell>{formatCurrencyBOB(item.quantity * item.unitCostBOB)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pagos</CardTitle>
          {!isAddingPayment ? (
            <Button variant="outline" size="sm" onClick={() => setIsAddingPayment(true)}>
              <Plus className="size-4" />
              Agregar pago
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Cuenta destino</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>{formatCurrencyBOB(payment.amountBOB)}</TableCell>
                  <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                  <TableCell>{payment.accountDestination || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isAddingPayment ? (
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-border p-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-purchase-payment-amount">Monto (Bs.)</Label>
                <Input
                  id="new-purchase-payment-amount"
                  type="number"
                  step="0.01"
                  value={newPayment.amountBOB}
                  onChange={(event) =>
                    setNewPayment({ ...newPayment, amountBOB: Number(event.target.value) })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="new-purchase-payment-method">Método</Label>
                <Select
                  value={newPayment.method}
                  onValueChange={(value) =>
                    setNewPayment({
                      ...newPayment,
                      method: (value ?? DEFAULT_PAYMENT_METHOD) as PaymentMethod,
                    })
                  }
                >
                  <SelectTrigger id="new-purchase-payment-method">
                    <SelectValue>{() => PAYMENT_METHOD_LABELS[newPayment.method]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="new-purchase-payment-account">Cuenta destino</Label>
                <Input
                  id="new-purchase-payment-account"
                  value={newPayment.accountDestination}
                  onChange={(event) =>
                    setNewPayment({ ...newPayment, accountDestination: event.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 sm:col-span-3">
                <Button
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={handleConfirmPayment}
                >
                  Confirmar pago
                </Button>
                <Button variant="outline" onClick={() => setIsAddingPayment(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1 border-t pt-4 text-sm">
            <span className="text-muted-foreground">Total: {formatCurrencyBOB(totalBOB)}</span>
            <span className="text-muted-foreground">Pagado: {formatCurrencyBOB(paidBOB)}</span>
            <span className="font-semibold text-foreground">
              Saldo pendiente: {formatCurrencyBOB(pendingBOB)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
