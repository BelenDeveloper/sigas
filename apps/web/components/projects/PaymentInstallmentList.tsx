"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";

import type { RecordedPayment } from "@/hooks/use-projects";
import { formatCurrencyBOB } from "@/lib/format-currency";

import { PaymentInstallmentCard } from "./PaymentInstallmentCard";

const NO_PAYMENTS_MESSAGE = "Todavía no se registraron pagos.";

interface PaymentInstallmentListProps {
  payments: RecordedPayment[];
  totalValueBOB: number;
  onAddPayment: () => void;
}

export function PaymentInstallmentList({ payments, totalValueBOB, onAddPayment }: PaymentInstallmentListProps) {
  const collectedBOB = payments.reduce((sum, payment) => sum + payment.amountBOB, 0);
  const pendingBOB = Math.max(totalValueBOB - collectedBOB, 0);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-muted-foreground">
        Cobrado: {formatCurrencyBOB(collectedBOB)} / Total: {formatCurrencyBOB(totalValueBOB)} — Pendiente:{" "}
        {formatCurrencyBOB(pendingBOB)}
      </span>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{NO_PAYMENTS_MESSAGE}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {payments.map((payment) => (
            <PaymentInstallmentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" className="w-fit" onClick={onAddPayment}>
        <Plus className="size-4" />
        Agregar otro pago
      </Button>
    </div>
  );
}
