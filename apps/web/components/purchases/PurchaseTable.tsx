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

import { formatCurrencyBOB } from "@/lib/format-currency";
import type { Purchase } from "@/lib/mocks/purchases.mock";
import {
  getPurchasePaidBOB,
  getPurchasePendingBOB,
  getPurchaseStatus,
  getPurchaseTotalBOB,
} from "@/lib/purchase-helpers";

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
  purchases: Purchase[];
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
          purchases.map((purchase) => {
            const totalBOB = getPurchaseTotalBOB(purchase);
            const paidBOB = getPurchasePaidBOB(purchase);
            const pendingBOB = getPurchasePendingBOB(purchase);
            const status = getPurchaseStatus(purchase);

            return (
              <TableRow
                key={purchase.id}
                className="cursor-pointer"
                onClick={() => goToPurchaseDetail(purchase.id)}
              >
                <TableCell className="font-mono text-xs">{purchase.code}</TableCell>
                <TableCell>{formatPurchaseDate(purchase.date)}</TableCell>
                <TableCell className="font-medium text-foreground">
                  {purchase.supplierName}
                </TableCell>
                <TableCell>{purchase.items.length}</TableCell>
                <TableCell>{formatCurrencyBOB(totalBOB)}</TableCell>
                <TableCell>{formatCurrencyBOB(paidBOB)}</TableCell>
                <TableCell>{formatCurrencyBOB(pendingBOB)}</TableCell>
                <TableCell>
                  <PurchaseStatusBadge status={status} />
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
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
