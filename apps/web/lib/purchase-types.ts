export const PURCHASE_STATUSES = ["pending", "partial", "paid"] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
};
