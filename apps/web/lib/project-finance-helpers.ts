import type { ProjectDetail } from "@/hooks/use-projects";

type Project = ProjectDetail;

export function getProjectCollectedBOB(project: Pick<Project, "paymentsReceived">): number {
  return project.paymentsReceived.reduce((sum, payment) => sum + payment.amountBOB, 0);
}

export function getProjectTotalExpensesBOB(project: Pick<Project, "expenses">): number {
  return project.expenses.reduce((sum, expense) => sum + expense.amountBOB, 0);
}

export function getProjectGrossMarginBOB(
  project: Pick<Project, "paymentsReceived" | "expenses">,
): number {
  return getProjectCollectedBOB(project) - getProjectTotalExpensesBOB(project);
}
