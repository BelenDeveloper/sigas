import type { Purchase } from "@/lib/mocks/purchases.mock";

export type PurchaseStatus = "pending" | "partial" | "paid";

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
};

export function getPurchaseTotalBOB(purchase: Pick<Purchase, "items">): number {
  return purchase.items.reduce((sum, item) => sum + item.quantity * item.unitCostBOB, 0);
}

export function getPurchasePaidBOB(purchase: Pick<Purchase, "payments">): number {
  return purchase.payments.reduce((sum, payment) => sum + payment.amountBOB, 0);
}

export function getPurchasePendingBOB(purchase: Pick<Purchase, "items" | "payments">): number {
  return getPurchaseTotalBOB(purchase) - getPurchasePaidBOB(purchase);
}

export function getPurchaseStatus(purchase: Pick<Purchase, "items" | "payments">): PurchaseStatus {
  const paidBOB = getPurchasePaidBOB(purchase);

  if (paidBOB <= 0) {
    return "pending";
  }

  const totalBOB = getPurchaseTotalBOB(purchase);
  return paidBOB >= totalBOB ? "paid" : "partial";
}
