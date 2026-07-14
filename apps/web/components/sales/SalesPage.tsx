"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import Link from "next/link";

import { useSales } from "@/hooks/use-sales";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { hasModulePermission } from "@/lib/permission-helpers";

import { SaleFilters } from "./SaleFilters";
import { SaleTable } from "./SaleTable";

const NEW_SALE_ROUTE = "/sales/new";
const SALES_MODULE = "sales";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";

export function SalesPage() {
  const authUser = useAtomValue(authUserAtom);
  const canViewSales = hasModulePermission(authUser, SALES_MODULE, "canView");
  const canCreateSale = hasModulePermission(authUser, SALES_MODULE, "canCreate");

  const { sales, filters, setFilters, isLoading } = useSales();

  if (!canViewSales) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SaleFilters filters={filters} onFiltersChange={setFilters} />
        {canCreateSale ? (
          <Button
            nativeButton={false}
            render={<Link href={NEW_SALE_ROUTE} />}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Plus className="size-4" />
            Nueva venta
          </Button>
        ) : null}
      </div>

      <SaleTable sales={sales} isLoading={isLoading} />
    </div>
  );
}
