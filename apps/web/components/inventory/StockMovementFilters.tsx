"use client";

import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

import {
  ALL_MOVEMENT_TYPES_OPTION,
  type StockMovementFilterState,
} from "@/hooks/use-inventory";
import type { StockMovementType } from "@/lib/inventory-types";

const ALL_MOVEMENT_TYPES_LABEL = "Todos los tipos";

const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUSTMENT: "Ajuste",
};

interface StockMovementFiltersProps {
  filters: StockMovementFilterState;
  onFiltersChange: (filters: Partial<StockMovementFilterState>) => void;
}

export function StockMovementFilters({ filters, onFiltersChange }: StockMovementFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="movement-search">Buscar producto</Label>
        <Input
          id="movement-search"
          placeholder="Nombre del producto"
          className="w-56"
          value={filters.searchTerm}
          onChange={(event) => onFiltersChange({ searchTerm: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="movement-type">Tipo de movimiento</Label>
        <Select
          value={filters.movementType}
          onValueChange={(movementType) =>
            onFiltersChange({
              movementType: (movementType ??
                ALL_MOVEMENT_TYPES_OPTION) as StockMovementFilterState["movementType"],
            })
          }
        >
          <SelectTrigger id="movement-type" className="w-48">
            <SelectValue>
              {() =>
                filters.movementType === ALL_MOVEMENT_TYPES_OPTION
                  ? ALL_MOVEMENT_TYPES_LABEL
                  : MOVEMENT_TYPE_LABELS[filters.movementType]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MOVEMENT_TYPES_OPTION}>{ALL_MOVEMENT_TYPES_LABEL}</SelectItem>
            <SelectItem value="IN">{MOVEMENT_TYPE_LABELS.IN}</SelectItem>
            <SelectItem value="OUT">{MOVEMENT_TYPE_LABELS.OUT}</SelectItem>
            <SelectItem value="ADJUSTMENT">{MOVEMENT_TYPE_LABELS.ADJUSTMENT}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="movement-date-from">Desde</Label>
        <Input
          id="movement-date-from"
          type="date"
          className="w-40"
          value={filters.dateFrom}
          onChange={(event) => onFiltersChange({ dateFrom: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="movement-date-to">Hasta</Label>
        <Input
          id="movement-date-to"
          type="date"
          className="w-40"
          value={filters.dateTo}
          onChange={(event) => onFiltersChange({ dateTo: event.target.value })}
        />
      </div>
    </div>
  );
}
