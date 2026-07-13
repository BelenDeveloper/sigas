import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { cn } from "@repo/ui/lib/utils";
import { Ban } from "lucide-react";

import type { CashEntryView } from "@/hooks/use-cash";
import { CASH_ENTRY_CATEGORY_LABELS, type CashEntryType } from "@/lib/cash-types";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";

const NO_ENTRIES_MESSAGE = "No se encontraron movimientos con estos filtros.";
const TIME_LOCALE = "es-BO";

const ENTRY_TYPE_LABELS: Record<CashEntryType, string> = {
  income: "Ingreso",
  expense: "Gasto",
};

const ENTRY_TYPE_TEXT_CLASSES: Record<CashEntryType, string> = {
  income: "text-emerald-700 dark:text-emerald-400",
  expense: "text-red-700 dark:text-red-400",
};

function formatTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString(TIME_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface CashEntryTableProps {
  entries: CashEntryView[];
  canCancel: boolean;
  onCancelEntry: (entryId: string) => void;
}

export function CashEntryTable({ entries, canCancel, onCancelEntry }: CashEntryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Método</TableHead>
          <TableHead>Destino</TableHead>
          <TableHead>Monto</TableHead>
          {canCancel ? <TableHead className="text-right">Acciones</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length === 0 ? (
          <TableRow>
            <TableCell colSpan={canCancel ? 8 : 7} className="text-center text-muted-foreground">
              {NO_ENTRIES_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          entries.map((entry) => (
            <TableRow
              key={entry.id}
              className={cn(entry.isCancelled && "text-muted-foreground line-through")}
            >
              <TableCell>{formatTime(entry.createdAt)}</TableCell>
              <TableCell className={cn(!entry.isCancelled && ENTRY_TYPE_TEXT_CLASSES[entry.type])}>
                {ENTRY_TYPE_LABELS[entry.type]}
              </TableCell>
              <TableCell>{CASH_ENTRY_CATEGORY_LABELS[entry.category]}</TableCell>
              <TableCell className="font-medium text-foreground">{entry.description}</TableCell>
              <TableCell>{PAYMENT_METHOD_LABELS[entry.method]}</TableCell>
              <TableCell>{entry.accountDestination}</TableCell>
              <TableCell className={cn(!entry.isCancelled && ENTRY_TYPE_TEXT_CLASSES[entry.type])}>
                {formatCurrencyBOB(entry.amountBOB)}
              </TableCell>
              {canCancel ? (
                <TableCell className="text-right">
                  {!entry.isCancelled ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Cancelar movimiento"
                      onClick={() => onCancelEntry(entry.id)}
                    >
                      <Ban className="size-4" />
                    </Button>
                  ) : null}
                </TableCell>
              ) : null}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
