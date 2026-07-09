import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

import { formatCurrencyBOB } from "@/lib/format-currency";
import type { CashDestination } from "@/lib/mocks/dashboard.mock";

interface CashDestinationCardProps {
  destinations: CashDestination[];
}

export function CashDestinationCard({ destinations }: CashDestinationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Dónde está el dinero?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {destinations.map((destination) => (
          <div key={destination.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${destination.colorClassName}`} />
              <span className="text-sm text-foreground">{destination.name}</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {formatCurrencyBOB(destination.amountBOB)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
