"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

import type {
  ExpenseInput,
  PaymentInput,
  PaymentInstallment,
  ProjectDetail,
} from "@/hooks/use-projects";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";
import type { GetProjectUploadUrl } from "@/lib/project-file-upload";
import {
  getProjectCollectedBOB,
  getProjectGrossMarginBOB,
  getProjectTotalExpensesBOB,
} from "@/lib/project-finance-helpers";

import { AddExpenseDialog } from "./AddExpenseDialog";
import { ProjectExpenseList } from "./ProjectExpenseList";
import { RecordPaymentDialog } from "./RecordPaymentDialog";

const DATE_LOCALE = "es-BO";
const INSTALLMENTS: PaymentInstallment[] = ["first", "second"];
const INSTALLMENT_LABELS: Record<PaymentInstallment, string> = { first: "Cuota 1", second: "Cuota 2" };
const PAYMENT_NOT_RECORDED_MESSAGE = "Todavía no se registró el pago.";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface FinanceTabProps {
  project: ProjectDetail;
  getUploadUrl: GetProjectUploadUrl;
  onRecordPayment: (installment: PaymentInstallment, input: PaymentInput) => void;
  onAddExpense: (input: ExpenseInput) => void;
}

export function FinanceTab({ project, getUploadUrl, onRecordPayment, onAddExpense }: FinanceTabProps) {
  const [paymentInstallment, setPaymentInstallment] = useState<PaymentInstallment | null>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const collectedBOB = getProjectCollectedBOB(project);
  const totalExpensesBOB = getProjectTotalExpensesBOB(project);
  const grossMarginBOB = getProjectGrossMarginBOB(project);

  const handleClosePaymentDialog = (isOpen: boolean) => {
    if (!isOpen) {
      setPaymentInstallment(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Valor total</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatCurrencyBOB(project.totalValueBOB)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Cobrado</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatCurrencyBOB(collectedBOB)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Gastos totales</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatCurrencyBOB(totalExpensesBOB)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Margen bruto</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatCurrencyBOB(grossMarginBOB)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos recibidos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {INSTALLMENTS.map((installment) => {
            const received =
              installment === "first" ? project.firstPaymentReceived : project.secondPaymentReceived;
            const targetAmountBOB =
              installment === "first" ? project.firstPaymentAmountBOB : project.secondPaymentAmountBOB;

            return (
              <div
                key={installment}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {INSTALLMENT_LABELS[installment]} — {formatCurrencyBOB(targetAmountBOB)}
                  </span>
                  {received ? (
                    <span className="text-xs text-muted-foreground">
                      {formatCurrencyBOB(received.amountBOB)} · {formatDate(received.date)} ·{" "}
                      {PAYMENT_METHOD_LABELS[received.method]}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{PAYMENT_NOT_RECORDED_MESSAGE}</span>
                  )}
                </div>
                {!received ? (
                  <Button variant="outline" size="sm" onClick={() => setPaymentInstallment(installment)}>
                    Registrar pago
                  </Button>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gastos</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsExpenseDialogOpen(true)}>
            <Plus className="size-4" />
            Agregar gasto
          </Button>
        </CardHeader>
        <CardContent>
          <ProjectExpenseList expenses={project.expenses} />
        </CardContent>
      </Card>

      <RecordPaymentDialog
        installment={paymentInstallment}
        open={paymentInstallment !== null}
        onOpenChange={handleClosePaymentDialog}
        onConfirm={onRecordPayment}
      />

      <AddExpenseDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        currentStage={project.stage}
        getUploadUrl={getUploadUrl}
        onCreate={onAddExpense}
      />
    </div>
  );
}
