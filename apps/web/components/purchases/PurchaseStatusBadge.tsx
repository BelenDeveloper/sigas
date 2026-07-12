import { Badge } from "@repo/ui/components/ui/badge";

import { PURCHASE_STATUS_LABELS, type PurchaseStatus } from "@/lib/purchase-types";

const PURCHASE_STATUS_BADGE_CLASSES: Record<PurchaseStatus, string> = {
  pending: "bg-red-100 text-red-800",
  partial: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
};

interface PurchaseStatusBadgeProps {
  status: PurchaseStatus;
}

export function PurchaseStatusBadge({ status }: PurchaseStatusBadgeProps) {
  return (
    <Badge className={PURCHASE_STATUS_BADGE_CLASSES[status]}>
      {PURCHASE_STATUS_LABELS[status]}
    </Badge>
  );
}
