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
  ALL_CASH_ENTRY_CATEGORIES_OPTION,
  ALL_CASH_ENTRY_TYPES_OPTION,
  ALL_PAYMENT_METHODS_OPTION,
  type CashEntryFilterState,
} from "@/hooks/use-cash";
import {
  CASH_ENTRY_CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type CashEntryCategory,
  type CashEntryType,
} from "@/lib/mocks/cash.mock";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";

const ALL_TYPES_LABEL = "Todos los tipos";
const ALL_CATEGORIES_LABEL = "Todas las categorías";
const ALL_METHODS_LABEL = "Todos los métodos";

const ENTRY_TYPE_LABELS: Record<CashEntryType, string> = {
  income: "Ingreso",
  expense: "Gasto",
};

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];

interface CashEntryFiltersProps {
  filters: CashEntryFilterState;
  onFiltersChange: (filters: Partial<CashEntryFilterState>) => void;
}

export function CashEntryFilters({ filters, onFiltersChange }: CashEntryFiltersProps) {
  const visibleCategories: CashEntryCategory[] =
    filters.type === "income"
      ? INCOME_CATEGORIES
      : filters.type === "expense"
        ? EXPENSE_CATEGORIES
        : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cash-entry-filter-type">Tipo</Label>
        <Select
          value={filters.type}
          onValueChange={(type) =>
            onFiltersChange({
              type: (type ?? ALL_CASH_ENTRY_TYPES_OPTION) as CashEntryFilterState["type"],
              category: ALL_CASH_ENTRY_CATEGORIES_OPTION,
            })
          }
        >
          <SelectTrigger id="cash-entry-filter-type" className="w-40">
            <SelectValue>
              {() =>
                filters.type === ALL_CASH_ENTRY_TYPES_OPTION
                  ? ALL_TYPES_LABEL
                  : ENTRY_TYPE_LABELS[filters.type]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CASH_ENTRY_TYPES_OPTION}>{ALL_TYPES_LABEL}</SelectItem>
            <SelectItem value="income">{ENTRY_TYPE_LABELS.income}</SelectItem>
            <SelectItem value="expense">{ENTRY_TYPE_LABELS.expense}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cash-entry-filter-category">Categoría</Label>
        <Select
          value={filters.category}
          onValueChange={(category) =>
            onFiltersChange({
              category: (category ?? ALL_CASH_ENTRY_CATEGORIES_OPTION) as CashEntryFilterState["category"],
            })
          }
        >
          <SelectTrigger id="cash-entry-filter-category" className="w-48">
            <SelectValue>
              {() =>
                filters.category === ALL_CASH_ENTRY_CATEGORIES_OPTION
                  ? ALL_CATEGORIES_LABEL
                  : CASH_ENTRY_CATEGORY_LABELS[filters.category]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CASH_ENTRY_CATEGORIES_OPTION}>{ALL_CATEGORIES_LABEL}</SelectItem>
            {visibleCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {CASH_ENTRY_CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cash-entry-filter-method">Método de pago</Label>
        <Select
          value={filters.method}
          onValueChange={(method) =>
            onFiltersChange({ method: (method ?? ALL_PAYMENT_METHODS_OPTION) as CashEntryFilterState["method"] })
          }
        >
          <SelectTrigger id="cash-entry-filter-method" className="w-48">
            <SelectValue>
              {() =>
                filters.method === ALL_PAYMENT_METHODS_OPTION
                  ? ALL_METHODS_LABEL
                  : PAYMENT_METHOD_LABELS[filters.method]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PAYMENT_METHODS_OPTION}>{ALL_METHODS_LABEL}</SelectItem>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cash-entry-filter-date">Fecha</Label>
        <Input
          id="cash-entry-filter-date"
          type="date"
          className="w-40"
          value={filters.date}
          onChange={(event) => onFiltersChange({ date: event.target.value })}
        />
      </div>
    </div>
  );
}
