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

import { ALL_PURCHASE_STATUSES_OPTION, type PurchaseFilterState } from "@/hooks/use-purchases";
import { PURCHASE_STATUSES, PURCHASE_STATUS_LABELS } from "@/lib/purchase-types";

const ALL_STATUSES_LABEL = "Todos los estados";

interface PurchaseFiltersProps {
  filters: PurchaseFilterState;
  onFiltersChange: (filters: Partial<PurchaseFilterState>) => void;
}

export function PurchaseFilters({ filters, onFiltersChange }: PurchaseFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="purchase-filter-search">Buscar proveedor</Label>
        <Input
          id="purchase-filter-search"
          placeholder="Nombre del proveedor"
          className="w-56"
          value={filters.searchTerm}
          onChange={(event) => onFiltersChange({ searchTerm: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="purchase-filter-status">Estado</Label>
        <Select
          value={filters.status}
          onValueChange={(status) =>
            onFiltersChange({
              status: (status ?? ALL_PURCHASE_STATUSES_OPTION) as PurchaseFilterState["status"],
            })
          }
        >
          <SelectTrigger id="purchase-filter-status" className="w-48">
            <SelectValue>
              {() =>
                filters.status === ALL_PURCHASE_STATUSES_OPTION
                  ? ALL_STATUSES_LABEL
                  : PURCHASE_STATUS_LABELS[filters.status]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PURCHASE_STATUSES_OPTION}>{ALL_STATUSES_LABEL}</SelectItem>
            {PURCHASE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {PURCHASE_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="purchase-filter-date-from">Desde</Label>
        <Input
          id="purchase-filter-date-from"
          type="date"
          className="w-40"
          value={filters.dateFrom}
          onChange={(event) => onFiltersChange({ dateFrom: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="purchase-filter-date-to">Hasta</Label>
        <Input
          id="purchase-filter-date-to"
          type="date"
          className="w-40"
          value={filters.dateTo}
          onChange={(event) => onFiltersChange({ dateTo: event.target.value })}
        />
      </div>
    </div>
  );
}
