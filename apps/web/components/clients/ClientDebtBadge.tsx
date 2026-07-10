import { Badge } from "@repo/ui/components/ui/badge";

import { formatCurrencyBOB } from "@/lib/format-currency";

const PAID_UP_LABEL = "Al día";
const PAID_UP_BADGE_CLASSES = "bg-emerald-100 text-emerald-800";

interface ClientDebtBadgeProps {
  totalDebtBOB: number;
}

export function ClientDebtBadge({ totalDebtBOB }: ClientDebtBadgeProps) {
  const hasDebt = totalDebtBOB > 0;

  if (!hasDebt) {
    return <Badge className={PAID_UP_BADGE_CLASSES}>{PAID_UP_LABEL}</Badge>;
  }

  return <Badge variant="destructive">{formatCurrencyBOB(totalDebtBOB)}</Badge>;
}
