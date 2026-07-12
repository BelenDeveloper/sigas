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
import { Switch } from "@repo/ui/components/ui/switch";

import {
  ALL_CATEGORIES_OPTION_ID,
  ALL_SUBCATEGORIES_OPTION_ID,
  type ProductFilterState,
} from "@/hooks/use-inventory";
import type { ProductCategory, ProductSubcategory } from "@/lib/inventory-types";

const ALL_CATEGORIES_LABEL = "Todas las categorías";
const ALL_SUBCATEGORIES_LABEL = "Todas las subcategorías";

function findLabel(id: string, allLabel: string, items: { id: string; name: string }[]): string {
  if (id === ALL_CATEGORIES_OPTION_ID) {
    return allLabel;
  }

  return items.find((item) => item.id === id)?.name ?? allLabel;
}

interface ProductFiltersProps {
  filters: ProductFilterState;
  onFiltersChange: (filters: Partial<ProductFilterState>) => void;
  categories: ProductCategory[];
  subcategories: ProductSubcategory[];
}

export function ProductFilters({
  filters,
  onFiltersChange,
  categories,
  subcategories,
}: ProductFiltersProps) {
  const visibleSubcategories = subcategories.filter(
    (subcategory) =>
      filters.categoryId === ALL_CATEGORIES_OPTION_ID ||
      subcategory.categoryId === filters.categoryId,
  );

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-search">Buscar</Label>
        <Input
          id="product-search"
          placeholder="Nombre o SKU"
          className="w-56"
          value={filters.searchTerm}
          onChange={(event) => onFiltersChange({ searchTerm: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-category">Categoría</Label>
        <Select
          value={filters.categoryId}
          onValueChange={(categoryId) =>
            onFiltersChange({
              categoryId: categoryId ?? ALL_CATEGORIES_OPTION_ID,
              subcategoryId: ALL_SUBCATEGORIES_OPTION_ID,
            })
          }
        >
          <SelectTrigger id="product-category" className="w-48">
            <SelectValue>
              {() => findLabel(filters.categoryId, ALL_CATEGORIES_LABEL, categories)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_OPTION_ID}>{ALL_CATEGORIES_LABEL}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-subcategory">Subcategoría</Label>
        <Select
          value={filters.subcategoryId}
          onValueChange={(subcategoryId) =>
            onFiltersChange({ subcategoryId: subcategoryId ?? ALL_SUBCATEGORIES_OPTION_ID })
          }
        >
          <SelectTrigger id="product-subcategory" className="w-48">
            <SelectValue>
              {() =>
                findLabel(filters.subcategoryId, ALL_SUBCATEGORIES_LABEL, visibleSubcategories)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SUBCATEGORIES_OPTION_ID}>{ALL_SUBCATEGORIES_LABEL}</SelectItem>
            {visibleSubcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pb-2">
        <Switch
          id="product-show-inactive"
          checked={filters.showInactive}
          onCheckedChange={(showInactive) => onFiltersChange({ showInactive })}
        />
        <Label htmlFor="product-show-inactive">Mostrar inactivos</Label>
      </div>
    </div>
  );
}
