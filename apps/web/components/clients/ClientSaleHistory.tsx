import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

import { formatCurrencyBOB } from "@/lib/format-currency";
import { SALE_PAYMENT_STATUS_LABELS, type ClientSale } from "@/lib/mocks/clients.mock";

const NO_SALES_MESSAGE = "Este cliente todavía no tiene ventas registradas.";
const DATE_LOCALE = "es-BO";

const PAYMENT_STATUS_BADGE_CLASSES: Record<ClientSale["paymentStatus"], string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-red-100 text-red-800",
  partial: "bg-amber-100 text-amber-800",
};

function formatSaleDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ClientSaleHistoryProps {
  sales: ClientSale[];
}

export function ClientSaleHistory({ sales }: ClientSaleHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado de pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {NO_SALES_MESSAGE}
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{formatSaleDate(sale.date)}</TableCell>
                  <TableCell className="font-mono text-xs">{sale.invoiceNumber}</TableCell>
                  <TableCell>{formatCurrencyBOB(sale.totalBOB)}</TableCell>
                  <TableCell>
                    <Badge className={PAYMENT_STATUS_BADGE_CLASSES[sale.paymentStatus]}>
                      {SALE_PAYMENT_STATUS_LABELS[sale.paymentStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
