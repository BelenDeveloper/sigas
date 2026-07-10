import { Badge } from "@repo/ui/components/ui/badge";

import { PAYABLE_STATUS_LABELS, type PayableStatus } from "@/lib/payable-helpers";

const PAYABLE_STATUS_BADGE_CLASSES: Record<PayableStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  partial: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
};

interface PayableStatusBadgeProps {
  status: PayableStatus;
}

export function PayableStatusBadge({ status }: PayableStatusBadgeProps) {
  return (
    <Badge className={PAYABLE_STATUS_BADGE_CLASSES[status]}>{PAYABLE_STATUS_LABELS[status]}</Badge>
  );
}
