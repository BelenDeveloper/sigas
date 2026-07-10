import { Badge } from "@repo/ui/components/ui/badge";

const LOW_STOCK_LABEL = "Bajo mínimo";

export function LowStockBadge() {
  return <Badge variant="destructive">{LOW_STOCK_LABEL}</Badge>;
}
