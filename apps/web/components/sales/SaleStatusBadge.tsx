import { Badge } from "@repo/ui/components/ui/badge";

import { SALE_STATUS_LABELS, type SaleStatus } from "@/lib/sale-types";

const SALE_STATUS_BADGE_CLASSES: Record<SaleStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  confirmed: "bg-blue-100 text-blue-800",
  partial: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

interface SaleStatusBadgeProps {
  status: SaleStatus;
}

export function SaleStatusBadge({ status }: SaleStatusBadgeProps) {
  return <Badge className={SALE_STATUS_BADGE_CLASSES[status]}>{SALE_STATUS_LABELS[status]}</Badge>;
}
