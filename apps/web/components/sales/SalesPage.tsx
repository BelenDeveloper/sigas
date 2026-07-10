"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

import { useSales } from "@/hooks/use-sales";

import { SaleFilters } from "./SaleFilters";
import { SaleTable } from "./SaleTable";

const NEW_SALE_ROUTE = "/sales/new";

export function SalesPage() {
  const { sales, filters, setFilters } = useSales();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SaleFilters filters={filters} onFiltersChange={setFilters} />
        <Button
          nativeButton={false}
          render={<Link href={NEW_SALE_ROUTE} />}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" />
          Nueva venta
        </Button>
      </div>

      <SaleTable sales={sales} />
    </div>
  );
}
