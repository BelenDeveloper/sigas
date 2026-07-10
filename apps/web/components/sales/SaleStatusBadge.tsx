import { Badge } from "@repo/ui/components/ui/badge";

import { SALE_TYPE_LABELS, type SaleType } from "@/lib/mocks/sales.mock";

const SALE_STATUS_BADGE_CLASSES: Record<SaleType, string> = {
  quotation: "bg-muted text-muted-foreground",
  order: "bg-blue-100 text-blue-800",
  sale: "bg-emerald-100 text-emerald-800",
  return: "bg-red-100 text-red-800",
};

interface SaleStatusBadgeProps {
  type: SaleType;
}

export function SaleStatusBadge({ type }: SaleStatusBadgeProps) {
  return <Badge className={SALE_STATUS_BADGE_CLASSES[type]}>{SALE_TYPE_LABELS[type]}</Badge>;
}
