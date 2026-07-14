import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

import { ListSkeleton } from "@/components/shared/ListSkeleton";
import { formatCurrencyBOB } from "@/lib/format-currency";
import type { PendingPayment } from "@/lib/mocks/dashboard.mock";

const DUE_DATE_LOCALE = "es-BO";
const SKELETON_ITEMS = 3;

interface PendingPaymentsListProps {
  payments: PendingPayment[];
  isLoading: boolean;
}

function formatDueDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DUE_DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PendingPaymentsList({ payments, isLoading }: PendingPaymentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagos pendientes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          <ListSkeleton items={SKELETON_ITEMS} />
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{payment.clientName}</span>
                <span className="text-xs text-muted-foreground">
                  Vence: {formatDueDate(payment.dueDate)}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrencyBOB(payment.amountBOB)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
