"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Receipt } from "lucide-react";
import { useState } from "react";

import type { ProjectExpense } from "@/hooks/use-projects";
import { getStageByKey } from "@/lib/constants/project-stages";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";
import { getProjectFileUrl } from "@/lib/project-file-upload";

const NO_EXPENSES_MESSAGE = "Todavía no hay gastos registrados.";
const DATE_LOCALE = "es-BO";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function sortByStage(expenses: ProjectExpense[]): ProjectExpense[] {
  return expenses.slice().sort((a, b) => {
    const stepA = getStageByKey(a.stage).step ?? Number.MAX_SAFE_INTEGER;
    const stepB = getStageByKey(b.stage).step ?? Number.MAX_SAFE_INTEGER;
    return stepA - stepB;
  });
}

interface ExpenseCardProps {
  expense: ProjectExpense;
}

function ExpenseCard({ expense }: ExpenseCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      {expense.receiptUrl ? (
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="size-10 shrink-0 overflow-hidden rounded-md border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase Storage receipt image */}
          <img
            src={getProjectFileUrl(expense.receiptUrl)}
            alt=""
            className="size-full object-cover"
          />
        </button>
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Receipt className="size-5" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1">
        <Badge variant="secondary" className="w-fit">
          {getStageByKey(expense.stage).label}
        </Badge>
        <span className="text-sm text-foreground">{expense.description}</span>
        <span className="text-xs text-muted-foreground">
          {formatDate(expense.date)} · {PAYMENT_METHOD_LABELS[expense.method]}
        </span>
      </div>

      <span className="text-sm font-semibold text-foreground">{formatCurrencyBOB(expense.amountBOB)}</span>

      {expense.receiptUrl ? (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogTitle className="sr-only">Comprobante — {expense.description}</DialogTitle>
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase Storage receipt image */}
            <img src={getProjectFileUrl(expense.receiptUrl)} alt="" className="w-full rounded-md" />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

interface ProjectExpenseListProps {
  expenses: ProjectExpense[];
}

export function ProjectExpenseList({ expenses }: ProjectExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="text-sm text-muted-foreground">{NO_EXPENSES_MESSAGE}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {sortByStage(expenses).map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
