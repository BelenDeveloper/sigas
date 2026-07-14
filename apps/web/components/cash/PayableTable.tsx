"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { ChevronDown, ChevronRight, CreditCard } from "lucide-react";
import { Fragment, useState } from "react";

import { usePayablePayments, type PayableView } from "@/hooks/use-cash";
import { CREDITOR_TYPE_LABELS } from "@/lib/cash-types";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";

import { PayableStatusBadge } from "./PayableStatusBadge";

import { TableSkeleton } from "../shared/TableSkeleton";

const NO_PAYABLES_MESSAGE = "No se encontraron cuentas por pagar con estos filtros.";
const NO_PAYMENTS_MESSAGE = "Todavía no se registraron pagos.";
const DATE_LOCALE = "es-BO";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const COLUMN_COUNT = 9;

interface PayableTableProps {
  payables: PayableView[];
  isLoading: boolean;
  canAddPayment: boolean;
  onAddPayment: (payable: PayableView) => void;
}

export function PayableTable({ payables, isLoading, canAddPayment, onAddPayment }: PayableTableProps) {
  const [expandedPayableId, setExpandedPayableId] = useState<string | null>(null);
  const payments = usePayablePayments(expandedPayableId);

  const toggleExpanded = (payableId: string) => {
    setExpandedPayableId((previous) => (previous === payableId ? null : payableId));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead />
          <TableHead>Acreedor</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Pagado</TableHead>
          <TableHead>Pendiente</TableHead>
          <TableHead>Vencimiento</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeleton columns={COLUMN_COUNT} />
        ) : payables.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLUMN_COUNT} className="text-center text-muted-foreground">
              {NO_PAYABLES_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          payables.map((payable) => {
            const isExpanded = expandedPayableId === payable.id;

            return (
              <Fragment key={payable.id}>
                <TableRow className="cursor-pointer" onClick={() => toggleExpanded(payable.id)}>
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{payable.creditorName}</TableCell>
                  <TableCell>{CREDITOR_TYPE_LABELS[payable.creditorType]}</TableCell>
                  <TableCell>{formatCurrencyBOB(payable.amountBOB)}</TableCell>
                  <TableCell>{formatCurrencyBOB(payable.paidBOB)}</TableCell>
                  <TableCell>{formatCurrencyBOB(payable.pendingBOB)}</TableCell>
                  <TableCell>{payable.dueDate ? formatDate(payable.dueDate) : "—"}</TableCell>
                  <TableCell>
                    <PayableStatusBadge status={payable.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {canAddPayment ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Agregar pago"
                        onClick={(event) => {
                          event.stopPropagation();
                          onAddPayment(payable);
                        }}
                      >
                        <CreditCard className="size-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>

                {isExpanded ? (
                  <TableRow>
                    <TableCell colSpan={9} className="bg-muted/30">
                      <div className="flex flex-col gap-3 py-2">
                        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                          <span className="text-muted-foreground">
                            Categoría: <span className="text-foreground">{payable.category || "—"}</span>
                          </span>
                          <span className="text-muted-foreground">
                            N° de factura:{" "}
                            <span className="text-foreground">{payable.invoiceNumber || "—"}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Notas: <span className="text-foreground">{payable.notes || "—"}</span>
                          </span>
                        </div>

                        {payments.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Destino</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                  <TableCell>{formatDate(payment.date)}</TableCell>
                                  <TableCell>{formatCurrencyBOB(payment.amountBOB)}</TableCell>
                                  <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                                  <TableCell>{payment.destination}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground">{NO_PAYMENTS_MESSAGE}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
