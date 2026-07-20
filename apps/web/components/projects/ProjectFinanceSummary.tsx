import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

import type { ProjectDetail } from "@/hooks/use-projects";
import { formatCurrencyBOB } from "@/lib/format-currency";
import {
  getProjectCollectedBOB,
  getProjectGrossMarginBOB,
  getProjectTotalExpensesBOB,
} from "@/lib/project-finance-helpers";

interface ProjectFinanceSummaryProps {
  project: ProjectDetail;
}

export function ProjectFinanceSummary({ project }: ProjectFinanceSummaryProps) {
  const collectedBOB = getProjectCollectedBOB(project);
  const totalExpensesBOB = getProjectTotalExpensesBOB(project);
  const netBalanceBOB = getProjectGrossMarginBOB(project);
  const isNetBalancePositive = netBalanceBOB >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen financiero</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Valor total</span>
          <span className="text-xl font-semibold text-foreground">
            {formatCurrencyBOB(project.totalValueBOB)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Cobrado</span>
          <span className="text-xl font-semibold text-foreground">{formatCurrencyBOB(collectedBOB)}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Gastos totales</span>
          <span className="text-xl font-semibold text-foreground">
            {formatCurrencyBOB(totalExpensesBOB)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Saldo neto</span>
          <span
            className={
              isNetBalancePositive
                ? "text-xl font-semibold text-emerald-600 dark:text-emerald-400"
                : "text-xl font-semibold text-destructive"
            }
          >
            {formatCurrencyBOB(netBalanceBOB)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
