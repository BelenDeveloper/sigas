import { Badge } from "@repo/ui/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

import type { StockMovement, StockMovementType } from "@/lib/inventory-types";

const NO_MOVEMENTS_MESSAGE = "No se encontraron movimientos con estos filtros.";

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

interface StockMovementTableProps {
  movements: StockMovement[];
}

export function StockMovementTable({ movements }: StockMovementTableProps) {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              {NO_MOVEMENTS_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          movements.map((movement) => (
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
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
