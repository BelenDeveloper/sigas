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

import { ALL_SALE_TYPES_OPTION, type SaleFilterState } from "@/hooks/use-sales";
import { SALE_TYPE_LABELS, type SaleType } from "@/lib/mocks/sales.mock";

const ALL_SALE_TYPES_LABEL = "Todos los tipos";
const SALE_TYPES: SaleType[] = ["quotation", "order", "sale", "return"];

interface SaleFiltersProps {
  filters: SaleFilterState;
  onFiltersChange: (filters: Partial<SaleFilterState>) => void;
}

export function SaleFilters({ filters, onFiltersChange }: SaleFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="sale-filter-search">Buscar cliente</Label>
        <Input
          id="sale-filter-search"
          placeholder="Nombre del cliente"
          className="w-56"
          value={filters.searchTerm}
          onChange={(event) => onFiltersChange({ searchTerm: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sale-filter-type">Estado</Label>
        <Select
          value={filters.type}
          onValueChange={(type) =>
            onFiltersChange({ type: (type ?? ALL_SALE_TYPES_OPTION) as SaleFilterState["type"] })
          }
        >
          <SelectTrigger id="sale-filter-type" className="w-48">
            <SelectValue>
              {() =>
                filters.type === ALL_SALE_TYPES_OPTION
                  ? ALL_SALE_TYPES_LABEL
                  : SALE_TYPE_LABELS[filters.type]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SALE_TYPES_OPTION}>{ALL_SALE_TYPES_LABEL}</SelectItem>
            {SALE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {SALE_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sale-filter-date-from">Desde</Label>
        <Input
          id="sale-filter-date-from"
          type="date"
          className="w-40"
          value={filters.dateFrom}
          onChange={(event) => onFiltersChange({ dateFrom: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sale-filter-date-to">Hasta</Label>
        <Input
          id="sale-filter-date-to"
          type="date"
          className="w-40"
          value={filters.dateTo}
          onChange={(event) => onFiltersChange({ dateTo: event.target.value })}
        />
      </div>
    </div>
  );
}
