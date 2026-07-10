import type { Project } from "@/lib/mocks/projects.mock";

export function getProjectCollectedBOB(project: Pick<Project, "firstPaymentReceived" | "secondPaymentReceived">): number {
  const firstAmountBOB = project.firstPaymentReceived?.amountBOB ?? 0;
  const secondAmountBOB = project.secondPaymentReceived?.amountBOB ?? 0;

  return firstAmountBOB + secondAmountBOB;
}

export function getProjectTotalExpensesBOB(project: Pick<Project, "expenses">): number {
  return project.expenses.reduce((sum, expense) => sum + expense.amountBOB, 0);
}

export function getProjectGrossMarginBOB(
  project: Pick<Project, "firstPaymentReceived" | "secondPaymentReceived" | "expenses">,
): number {
  return getProjectCollectedBOB(project) - getProjectTotalExpensesBOB(project);
}
