import { Card, CardContent } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trendPercent?: number;
}

export function KpiCard({ label, value, icon: Icon, trendPercent }: KpiCardProps) {
  const hasTrend = typeof trendPercent === "number";
  const isPositiveTrend = hasTrend && trendPercent >= 0;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold text-foreground">{value}</span>
          {hasTrend ? (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositiveTrend ? "text-emerald-600" : "text-destructive",
              )}
            >
              {isPositiveTrend ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {Math.abs(trendPercent)}% vs. mes anterior
            </span>
          ) : null}
        </div>
        <div className="rounded-lg bg-brand/10 p-2 text-brand">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
