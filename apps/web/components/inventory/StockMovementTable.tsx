import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Loader2 } from "lucide-react";

import type { StockMovement, StockMovementType } from "@/lib/inventory-types";

import { TableSkeleton } from "../shared/TableSkeleton";

const NO_MOVEMENTS_MESSAGE = "No se encontraron movimientos con estos filtros.";
const COLUMN_COUNT = 10;
const NO_EXPECTED_ARRIVAL_PLACEHOLDER = "—";
const PENDING_ARRIVAL_LABEL = "Pendiente de llegada";
const RECEIVED_LABEL = "Recibido";
const MARK_RECEIVED_LABEL = "Marcar como recibido";

const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUSTMENT: "Ajuste",
};

const MOVEMENT_TYPE_BADGE_CLASSES: Record<StockMovementType, string> = {
  IN: "bg-emerald-100 text-emerald-800",
  OUT: "bg-red-100 text-red-800",
  ADJUSTMENT: "bg-muted text-muted-foreground",
};

const DATE_LOCALE = "es-BO";

function formatMovementDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateOnly(dateOnly: string): string {
  const parts = dateOnly.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface StockMovementTableProps {
  movements: StockMovement[];
  isLoading: boolean;
  receivingMovementId: string | null;
  onMarkReceived: (movement: StockMovement) => void;
}

export function StockMovementTable({
  movements,
  isLoading,
  receivingMovementId,
  onMarkReceived,
}: StockMovementTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Stock anterior</TableHead>
          <TableHead>Stock nuevo</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Creado por</TableHead>
          <TableHead>Llegada esperada</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeleton columns={COLUMN_COUNT} />
        ) : movements.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLUMN_COUNT} className="text-center text-muted-foreground">
              {NO_MOVEMENTS_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          movements.map((movement) => {
            const isPending = movement.status === "pending";
            const isReceivingThisMovement = receivingMovementId === movement.id;

            return (
              <TableRow key={movement.id}>
                <TableCell>{formatMovementDate(movement.createdAt)}</TableCell>
                <TableCell className="font-medium text-foreground">{movement.productName}</TableCell>
                <TableCell>
                  <Badge className={MOVEMENT_TYPE_BADGE_CLASSES[movement.type]}>
                    {MOVEMENT_TYPE_LABELS[movement.type]}
                  </Badge>
                </TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>{movement.stockBefore}</TableCell>
                <TableCell>{movement.newStock}</TableCell>
                <TableCell className="text-muted-foreground">{movement.reason}</TableCell>
                <TableCell>{movement.createdByName}</TableCell>
                <TableCell>
                  {movement.expectedArrivalDate
                    ? formatDateOnly(movement.expectedArrivalDate)
                    : NO_EXPECTED_ARRIVAL_PLACEHOLDER}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        isPending
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }
                    >
                      {isPending ? PENDING_ARRIVAL_LABEL : RECEIVED_LABEL}
                    </Badge>
                    {isPending ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={receivingMovementId !== null}
                        onClick={() => onMarkReceived(movement)}
                      >
                        {isReceivingThisMovement ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          MARK_RECEIVED_LABEL
                        )}
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
