import type { Payable } from "@/lib/mocks/cash.mock";

export type PayableStatus = "pending" | "partial" | "paid" | "overdue";

export const PAYABLE_STATUS_LABELS: Record<PayableStatus, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  overdue: "Vencido",
};

export function getPayablePaidBOB(payable: Pick<Payable, "payments">): number {
  return payable.payments.reduce((sum, payment) => sum + payment.amountBOB, 0);
}

export function getPayablePendingBOB(payable: Pick<Payable, "amountBOB" | "payments">): number {
  return payable.amountBOB - getPayablePaidBOB(payable);
}

export function getPayableStatus(
  payable: Pick<Payable, "amountBOB" | "dueDate" | "payments">,
): PayableStatus {
  const paidBOB = getPayablePaidBOB(payable);

  if (paidBOB >= payable.amountBOB) {
    return "paid";
  }

  const today = new Date().toISOString().slice(0, 10);
  if (payable.dueDate < today) {
    return "overdue";
  }

  return paidBOB > 0 ? "partial" : "pending";
}
