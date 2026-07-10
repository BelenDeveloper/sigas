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

import { useSales, type SalePaymentInput } from "@/hooks/use-sales";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { getSalePaidBOB, getSalePendingBOB, getSaleTotalBOB } from "@/lib/sale-helpers";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/mocks/sales.mock";

import { SaleStatusBadge } from "./SaleStatusBadge";
import { SalePdfButton } from "./SalePdfButton";

const SALE_NOT_FOUND_MESSAGE = "No se encontró la venta solicitada.";
const SALES_ROUTE = "/sales";
const DATE_LOCALE = "es-BO";
const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];
const DEFAULT_PAYMENT_METHOD: PaymentMethod = "cash";
const EMPTY_PAYMENT: SalePaymentInput = {
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

interface SaleDetailPageProps {
  saleId: string;
}

export function SaleDetailPage({ saleId }: SaleDetailPageProps) {
  const { getSaleById, addPayment } = useSales();
  const sale = getSaleById(saleId);

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<SalePaymentInput>(EMPTY_PAYMENT);

  if (!sale) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{SALE_NOT_FOUND_MESSAGE}</p>
        <Button variant="outline" nativeButton={false} render={<Link href={SALES_ROUTE} />} className="w-fit">
          <ArrowLeft className="size-4" />
          Volver a ventas
        </Button>
      </div>
    );
  }

  const totalBOB = getSaleTotalBOB(sale);
  const paidBOB = getSalePaidBOB(sale);
  const pendingBOB = getSalePendingBOB(sale);

  const handleConfirmPayment = () => {
    addPayment(sale.id, newPayment);
    setNewPayment(EMPTY_PAYMENT);
    setIsAddingPayment(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" nativeButton={false} render={<Link href={SALES_ROUTE} />} className="w-fit">
          <ArrowLeft className="size-4" />
          Volver a ventas
        </Button>
        <SalePdfButton saleId={sale.id} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{sale.code}</CardTitle>
            <p className="text-sm text-muted-foreground">{sale.clientName}</p>
          </div>
          <SaleStatusBadge type={sale.type} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Fecha</span>
            <span className="text-sm text-foreground">{formatDate(sale.date)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Notas</span>
            <span className="text-sm text-foreground">{sale.notes || "—"}</span>
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
                <TableHead>Precio unitario</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrencyBOB(item.unitPriceBOB)}</TableCell>
                  <TableCell>{formatCurrencyBOB(item.quantity * item.unitPriceBOB)}</TableCell>
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
              {sale.payments.map((payment) => (
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
                <Label htmlFor="new-payment-amount">Monto (Bs.)</Label>
                <Input
                  id="new-payment-amount"
                  type="number"
                  step="0.01"
                  value={newPayment.amountBOB}
                  onChange={(event) =>
                    setNewPayment({ ...newPayment, amountBOB: Number(event.target.value) })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="new-payment-method">Método</Label>
                <Select
                  value={newPayment.method}
                  onValueChange={(value) =>
                    setNewPayment({
                      ...newPayment,
                      method: (value ?? DEFAULT_PAYMENT_METHOD) as PaymentMethod,
                    })
                  }
                >
                  <SelectTrigger id="new-payment-method">
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
                <Label htmlFor="new-payment-account">Cuenta destino</Label>
                <Input
                  id="new-payment-account"
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
