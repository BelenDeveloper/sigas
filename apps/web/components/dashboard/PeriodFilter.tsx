"use client";

import { Input } from "@repo/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";

import type { PeriodOption } from "@/lib/date-range";

const PERIOD_LABELS: Record<PeriodOption, string> = {
  today: "Hoy",
  this_week: "Esta semana",
  this_month: "Este mes",
  custom: "Personalizado",
};

const PERIOD_OPTIONS: PeriodOption[] = ["today", "this_week", "this_month", "custom"];

interface PeriodFilterProps {
  period: PeriodOption;
  customFrom: string;
  customTo: string;
  onPeriodChange: (period: PeriodOption) => void;
  onCustomFromChange: (date: string) => void;
  onCustomToChange: (date: string) => void;
}

export function PeriodFilter({
  period,
  customFrom,
  customTo,
  onPeriodChange,
  onCustomFromChange,
  onCustomToChange,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={period} onValueChange={(value) => onPeriodChange((value ?? "today") as PeriodOption)}>
        <SelectTrigger className="w-40">
          <SelectValue>{() => PERIOD_LABELS[period]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {PERIOD_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {period === "custom" ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-40"
            value={customFrom}
            onChange={(event) => onCustomFromChange(event.target.value)}
          />
          <Input
            type="date"
            className="w-40"
            value={customTo}
            onChange={(event) => onCustomToChange(event.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
