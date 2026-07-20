"use client";

import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Receipt } from "lucide-react";
import { useState } from "react";

import type { RecordedPayment } from "@/hooks/use-projects";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";
import { getProjectFileUrl } from "@/lib/project-file-upload";

const DATE_LOCALE = "es-BO";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface PaymentInstallmentCardProps {
  payment: RecordedPayment;
}

export function PaymentInstallmentCard({ payment }: PaymentInstallmentCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
      <div className="flex items-center gap-3">
        {payment.receiptUrl ? (
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="size-12 shrink-0 overflow-hidden rounded-md border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase Storage receipt image */}
            <img
              src={getProjectFileUrl(payment.receiptUrl)}
              alt=""
              className="size-full object-cover"
            />
          </button>
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Receipt className="size-5" />
          </div>
        )}

        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Pago #{payment.paymentNumber} — {formatCurrencyBOB(payment.amountBOB)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(payment.date)} · {PAYMENT_METHOD_LABELS[payment.method]}
            {payment.accountDestination ? ` · ${payment.accountDestination}` : ""}
          </span>
        </div>
      </div>

      {payment.receiptUrl ? (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogTitle className="sr-only">Comprobante del pago #{payment.paymentNumber}</DialogTitle>
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase Storage receipt image */}
            <img src={getProjectFileUrl(payment.receiptUrl)} alt="" className="w-full rounded-md" />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
