"use client";

import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

import { ALL_CITIES_OPTION, type ClientFilterState } from "@/hooks/use-clients";

const ALL_CITIES_LABEL = "Todas las ciudades";

interface ClientFiltersProps {
  filters: ClientFilterState;
  onFiltersChange: (filters: Partial<ClientFilterState>) => void;
  cities: string[];
}

export function ClientFilters({ filters, onFiltersChange, cities }: ClientFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="client-filter-city">Ciudad</Label>
        <Select
          value={filters.city}
          onValueChange={(city) => onFiltersChange({ city: city ?? ALL_CITIES_OPTION })}
        >
          <SelectTrigger id="client-filter-city" className="w-48">
            <SelectValue>
              {() => (filters.city === ALL_CITIES_OPTION ? ALL_CITIES_LABEL : filters.city)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CITIES_OPTION}>{ALL_CITIES_LABEL}</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
