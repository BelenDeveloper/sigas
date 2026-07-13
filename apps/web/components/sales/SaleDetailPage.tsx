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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { useAtomValue } from "jotai";
import { ArrowLeft, Ban, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useSale, type SalePaymentInput } from "@/hooks/use-sales";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";
import { hasModulePermission } from "@/lib/permission-helpers";

import { SaleStatusBadge } from "./SaleStatusBadge";
import { SalePdfButton } from "./SalePdfButton";

const SALES_MODULE = "sales";
const ADMIN_ROLE = "admin";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";
const SALE_NOT_FOUND_MESSAGE = "No se encontró la venta solicitada.";
const SALES_ROUTE = "/sales";
const DATE_LOCALE = "es-BO";
const CANCELLED_STATUS = "cancelled";
const CANCEL_REASON_REQUIRED_MESSAGE = "Ingresa el motivo de la cancelación.";
const ACCOUNT_DESTINATION_REQUIRED_MESSAGE = "Indica a dónde fue el dinero (cuenta destino).";
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
  const authUser = useAtomValue(authUserAtom);
  const canViewSales = hasModulePermission(authUser, SALES_MODULE, "canView");
  const canEditSale = hasModulePermission(authUser, SALES_MODULE, "canEdit");
  const isAdmin = authUser?.role === ADMIN_ROLE;

  const { sale, isLoading, addPayment, cancelSale } = useSale(saleId);

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<SalePaymentInput>(EMPTY_PAYMENT);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!canViewSales) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  if (isLoading) {
    return null;
  }

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

  const canCancelSale = isAdmin && sale.status !== CANCELLED_STATUS;

  const handleConfirmPayment = () => {
    if (!newPayment.accountDestination.trim()) {
      setPaymentError(ACCOUNT_DESTINATION_REQUIRED_MESSAGE);
      return;
    }

    addPayment(newPayment);
    setPaymentError(null);
    setNewPayment(EMPTY_PAYMENT);
    setIsAddingPayment(false);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      setCancelError(CANCEL_REASON_REQUIRED_MESSAGE);
      return;
    }

    cancelSale(cancelReason);
    setCancelError(null);
    setCancelReason("");
    setIsCancelling(false);
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
          </div>
          <div className="flex items-center gap-2">
            <SaleStatusBadge status={sale.status} />
            {canCancelSale && !isCancelling ? (
              <Button variant="outline" size="sm" onClick={() => setIsCancelling(true)}>
                <Ban className="size-4" />
                Cancelar venta
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Fecha</span>
            <span className="text-sm text-foreground">{formatDate(sale.saleDate)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Notas</span>
            <span className="text-sm text-foreground">{sale.notes || "—"}</span>
          </div>

          {isCancelling ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:col-span-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cancel-reason">Motivo de la cancelación</Label>
                <Textarea
                  id="cancel-reason"
                  rows={2}
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                />
                {cancelError ? <p className="text-sm text-destructive">{cancelError}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleConfirmCancel}>
                  Confirmar cancelación
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCancelling(false);
                    setCancelError(null);
                    setCancelReason("");
                  }}
                >
                  Volver
                </Button>
              </div>
            </div>
          ) : null}
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
                  <TableCell>{formatCurrencyBOB(item.subtotalBOB)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pagos</CardTitle>
          {canEditSale && !isAddingPayment ? (
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
                  <TableCell>{formatDate(payment.paidAt)}</TableCell>
                  <TableCell>{formatCurrencyBOB(payment.amountBOB)}</TableCell>
                  <TableCell>{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</TableCell>
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

              {paymentError ? (
                <p className="text-sm text-destructive sm:col-span-3">{paymentError}</p>
              ) : null}

              <div className="flex gap-2 sm:col-span-3">
                <Button
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={handleConfirmPayment}
                >
                  Confirmar pago
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingPayment(false);
                    setPaymentError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1 border-t pt-4 text-sm">
            <span className="text-muted-foreground">Total: {formatCurrencyBOB(sale.totalBOB)}</span>
            <span className="text-muted-foreground">Pagado: {formatCurrencyBOB(sale.paidBOB)}</span>
            <span className="font-semibold text-foreground">
              Saldo pendiente: {formatCurrencyBOB(sale.pendingBOB)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
