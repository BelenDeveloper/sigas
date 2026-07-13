import { Receipt } from "lucide-react";

import type { ProjectExpense } from "@/hooks/use-projects";
import { getStageByKey } from "@/lib/constants/project-stages";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";

const NO_EXPENSES_MESSAGE = "Todavía no hay gastos registrados.";
const DATE_LOCALE = "es-BO";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ProjectExpenseListProps {
  expenses: ProjectExpense[];
}

export function ProjectExpenseList({ expenses }: ProjectExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="text-sm text-muted-foreground">{NO_EXPENSES_MESSAGE}</p>;
  }

  const stageKeys = Array.from(new Set(expenses.map((expense) => expense.stage))).sort((a, b) => {
    const stepA = getStageByKey(a).step ?? Number.MAX_SAFE_INTEGER;
    const stepB = getStageByKey(b).step ?? Number.MAX_SAFE_INTEGER;
    return stepA - stepB;
  });

  return (
    <div className="flex flex-col gap-6">
      {stageKeys.map((stageKey) => (
        <div key={stageKey} className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">{getStageByKey(stageKey).label}</span>
          <div className="flex flex-col gap-2">
            {expenses
              .filter((expense) => expense.stage === stageKey)
              .map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Receipt className="size-5" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm text-foreground">{expense.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(expense.date)} · {PAYMENT_METHOD_LABELS[expense.method]}
                      {expense.receiptUrl ? ` · ${expense.receiptUrl}` : ""}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrencyBOB(expense.amountBOB)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
