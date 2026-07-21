import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

import type { DestinationBalance } from "@/hooks/use-cash";
import type { CashContext } from "@/lib/cash-types";
import { formatCurrencyBOB } from "@/lib/format-currency";

const CARD_TITLES: Record<CashContext, string> = {
  sigas: "¿Dónde está el dinero?",
  projects: "Fondos de proyectos por destino",
};

interface WhereIsTheMoneyCardProps {
  cashContext: CashContext;
  destinationBalances: DestinationBalance[];
  totalBOB: number;
}

export function WhereIsTheMoneyCard({ cashContext, destinationBalances, totalBOB }: WhereIsTheMoneyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{CARD_TITLES[cashContext]}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4">
          {destinationBalances.map((balance) => (
            <div
              key={balance.destination}
              className="flex min-w-40 flex-1 flex-col gap-1 rounded-lg border border-border p-4"
            >
              <span className="text-sm text-muted-foreground">{balance.destination}</span>
              <span className="text-lg font-semibold text-foreground">
                {formatCurrencyBOB(balance.balanceBOB)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-semibold text-foreground">{formatCurrencyBOB(totalBOB)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
