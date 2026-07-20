"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

import type { ExpenseInput, PaymentInput, ProjectDetail } from "@/hooks/use-projects";
import type { GetProjectUploadUrl } from "@/lib/project-file-upload";

import { AddExpenseDialog } from "./AddExpenseDialog";
import { PaymentInstallmentList } from "./PaymentInstallmentList";
import { ProjectExpenseList } from "./ProjectExpenseList";
import { ProjectFinanceSummary } from "./ProjectFinanceSummary";
import { RecordPaymentDialog } from "./RecordPaymentDialog";

interface FinanceTabProps {
  project: ProjectDetail;
  getUploadUrl: GetProjectUploadUrl;
  isAddingExpense: boolean;
  isRecordingPayment: boolean;
  onRecordPayment: (input: PaymentInput) => Promise<void>;
  onAddExpense: (input: ExpenseInput) => Promise<void>;
}

export function FinanceTab({
  project,
  getUploadUrl,
  isAddingExpense,
  isRecordingPayment,
  onRecordPayment,
  onAddExpense,
}: FinanceTabProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <ProjectFinanceSummary project={project} />

      <Card>
        <CardHeader>
          <CardTitle>Pagos recibidos</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentInstallmentList
            payments={project.paymentsReceived}
            totalValueBOB={project.totalValueBOB}
            onAddPayment={() => setIsPaymentDialogOpen(true)}
          />
        </CardContent>
      </Card>

      <div className="border-t border-border" />

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
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        isRecordingPayment={isRecordingPayment}
        onConfirm={onRecordPayment}
      />

      <AddExpenseDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        currentStage={project.stage}
        getUploadUrl={getUploadUrl}
        isAddingExpense={isAddingExpense}
        onCreate={onAddExpense}
      />
    </div>
  );
}
