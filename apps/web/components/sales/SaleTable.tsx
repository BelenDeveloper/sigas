"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import type { SaleListItem } from "@/hooks/use-sales";
import { formatCurrencyBOB } from "@/lib/format-currency";

import { SaleStatusBadge } from "./SaleStatusBadge";

const NO_SALES_MESSAGE = "No se encontraron ventas con estos filtros.";
const DATE_LOCALE = "es-BO";

function formatSaleDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface SaleTableProps {
  sales: SaleListItem[];
}

export function SaleTable({ sales }: SaleTableProps) {
  const router = useRouter();

  const goToSaleDetail = (saleId: string) => {
    router.push(`/sales/${saleId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Ítems</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Pagado</TableHead>
          <TableHead>Pendiente</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground">
              {NO_SALES_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          sales.map((sale) => (
            <TableRow
              key={sale.id}
              className="cursor-pointer"
              onClick={() => goToSaleDetail(sale.id)}
            >
              <TableCell className="font-mono text-xs">{sale.code}</TableCell>
              <TableCell>{formatSaleDate(sale.date)}</TableCell>
              <TableCell className="font-medium text-foreground">{sale.clientName}</TableCell>
              <TableCell>{sale.itemCount}</TableCell>
              <TableCell>{formatCurrencyBOB(sale.totalBOB)}</TableCell>
              <TableCell>{formatCurrencyBOB(sale.paidBOB)}</TableCell>
              <TableCell>{formatCurrencyBOB(sale.pendingBOB)}</TableCell>
              <TableCell>
                <SaleStatusBadge status={sale.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Ver venta"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToSaleDetail(sale.id);
                  }}
                >
                  <Eye className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
