import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

import { getBalanceByDestination, getTotalCashBalanceBOB } from "@/lib/cash-helpers";
import { formatCurrencyBOB } from "@/lib/format-currency";
import type { CashEntry } from "@/lib/mocks/cash.mock";

interface WhereIsTheMoneyCardProps {
  entries: CashEntry[];
}

export function WhereIsTheMoneyCard({ entries }: WhereIsTheMoneyCardProps) {
  const balancesByDestination = getBalanceByDestination(entries);
  const totalBOB = getTotalCashBalanceBOB(entries);

  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Dónde está el dinero?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4">
          {balancesByDestination.map((balance) => (
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
