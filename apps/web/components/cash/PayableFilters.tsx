"use client";

import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

import { ALL_CREDITOR_TYPES_OPTION, ALL_PAYABLE_STATUSES_OPTION, type PayableFilterState } from "@/hooks/use-cash";
import { CREDITOR_TYPES, CREDITOR_TYPE_LABELS } from "@/lib/mocks/cash.mock";
import { PAYABLE_STATUS_LABELS, type PayableStatus } from "@/lib/payable-helpers";

const ALL_CREDITOR_TYPES_LABEL = "Todos";
const ALL_STATUSES_LABEL = "Todos los estados";
const PAYABLE_STATUSES: PayableStatus[] = ["pending", "partial", "paid", "overdue"];

interface PayableFiltersProps {
  filters: PayableFilterState;
  onFiltersChange: (filters: Partial<PayableFilterState>) => void;
}

export function PayableFilters({ filters, onFiltersChange }: PayableFiltersProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <Tabs
        value={filters.creditorType}
        onValueChange={(value) =>
          onFiltersChange({
            creditorType: (value ?? ALL_CREDITOR_TYPES_OPTION) as PayableFilterState["creditorType"],
          })
        }
      >
        <TabsList>
          <TabsTrigger value={ALL_CREDITOR_TYPES_OPTION}>{ALL_CREDITOR_TYPES_LABEL}</TabsTrigger>
          {CREDITOR_TYPES.map((creditorType) => (
            <TabsTrigger key={creditorType} value={creditorType}>
              {CREDITOR_TYPE_LABELS[creditorType]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2">
        <Label htmlFor="payable-filter-status">Estado</Label>
        <Select
          value={filters.status}
          onValueChange={(status) =>
            onFiltersChange({
              status: (status ?? ALL_PAYABLE_STATUSES_OPTION) as PayableFilterState["status"],
            })
          }
        >
          <SelectTrigger id="payable-filter-status" className="w-48">
            <SelectValue>
              {() =>
                filters.status === ALL_PAYABLE_STATUSES_OPTION
                  ? ALL_STATUSES_LABEL
                  : PAYABLE_STATUS_LABELS[filters.status]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PAYABLE_STATUSES_OPTION}>{ALL_STATUSES_LABEL}</SelectItem>
            {PAYABLE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {PAYABLE_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
