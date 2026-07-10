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

import { formatCurrencyBOB } from "@/lib/format-currency";
import { CREDITOR_TYPE_LABELS, type Payable } from "@/lib/mocks/cash.mock";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";
import {
  getPayablePaidBOB,
  getPayablePendingBOB,
  getPayableStatus,
} from "@/lib/payable-helpers";

import { PayableStatusBadge } from "./PayableStatusBadge";

const NO_PAYABLES_MESSAGE = "No se encontraron cuentas por pagar con estos filtros.";
const DATE_LOCALE = "es-BO";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface PayableTableProps {
  payables: Payable[];
  onAddPayment: (payable: Payable) => void;
}

export function PayableTable({ payables, onAddPayment }: PayableTableProps) {
  const [expandedPayableId, setExpandedPayableId] = useState<string | null>(null);

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
        {payables.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground">
              {NO_PAYABLES_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          payables.map((payable) => {
            const paidBOB = getPayablePaidBOB(payable);
            const pendingBOB = getPayablePendingBOB(payable);
            const status = getPayableStatus(payable);
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
                  <TableCell>{formatCurrencyBOB(paidBOB)}</TableCell>
                  <TableCell>{formatCurrencyBOB(pendingBOB)}</TableCell>
                  <TableCell>{formatDate(payable.dueDate)}</TableCell>
                  <TableCell>
                    <PayableStatusBadge status={status} />
                  </TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>

                {isExpanded ? (
                  <TableRow>
                    <TableCell colSpan={9} className="bg-muted/30">
                      <div className="flex flex-col gap-3 py-2">
                        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                          <span className="text-muted-foreground">
                            Categoría: <span className="text-foreground">{payable.category}</span>
                          </span>
                          <span className="text-muted-foreground">
                            N° de factura:{" "}
                            <span className="text-foreground">{payable.invoiceNumber || "—"}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Notas: <span className="text-foreground">{payable.notes || "—"}</span>
                          </span>
                        </div>

                        {payable.payments.length > 0 ? (
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
                              {payable.payments.map((payment) => (
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
                          <p className="text-sm text-muted-foreground">Todavía no se registraron pagos.</p>
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
