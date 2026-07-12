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

import type { PurchaseListItem } from "@/hooks/use-purchases";
import { formatCurrencyBOB } from "@/lib/format-currency";

import { PurchaseStatusBadge } from "./PurchaseStatusBadge";

const NO_PURCHASES_MESSAGE = "No se encontraron compras con estos filtros.";
const DATE_LOCALE = "es-BO";

function formatPurchaseDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface PurchaseTableProps {
  purchases: PurchaseListItem[];
}

export function PurchaseTable({ purchases }: PurchaseTableProps) {
  const router = useRouter();

  const goToPurchaseDetail = (purchaseId: string) => {
    router.push(`/purchases/${purchaseId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Proveedor</TableHead>
          <TableHead>Ítems</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Pagado</TableHead>
          <TableHead>Pendiente</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground">
              {NO_PURCHASES_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          purchases.map((purchase) => (
            <TableRow
              key={purchase.id}
              className="cursor-pointer"
              onClick={() => goToPurchaseDetail(purchase.id)}
            >
              <TableCell className="font-mono text-xs">{purchase.code}</TableCell>
              <TableCell>{formatPurchaseDate(purchase.date)}</TableCell>
              <TableCell className="font-medium text-foreground">{purchase.supplierName}</TableCell>
              <TableCell>{purchase.itemCount}</TableCell>
              <TableCell>{formatCurrencyBOB(purchase.totalBOB)}</TableCell>
              <TableCell>{formatCurrencyBOB(purchase.paidBOB)}</TableCell>
              <TableCell>{formatCurrencyBOB(purchase.pendingBOB)}</TableCell>
              <TableCell>
                <PurchaseStatusBadge status={purchase.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Ver compra"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPurchaseDetail(purchase.id);
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
