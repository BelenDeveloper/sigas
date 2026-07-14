"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import Link from "next/link";

import { usePurchases } from "@/hooks/use-purchases";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { hasModulePermission } from "@/lib/permission-helpers";

import { PurchaseFilters } from "./PurchaseFilters";
import { PurchaseTable } from "./PurchaseTable";

const NEW_PURCHASE_ROUTE = "/purchases/new";
const PURCHASES_MODULE = "purchases";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";

export function PurchasesPage() {
  const authUser = useAtomValue(authUserAtom);
  const canViewPurchases = hasModulePermission(authUser, PURCHASES_MODULE, "canView");
  const canCreatePurchase = hasModulePermission(authUser, PURCHASES_MODULE, "canCreate");

  const { purchases, filters, setFilters, isLoading } = usePurchases();

  if (!canViewPurchases) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PurchaseFilters filters={filters} onFiltersChange={setFilters} />
        {canCreatePurchase ? (
          <Button
            nativeButton={false}
            render={<Link href={NEW_PURCHASE_ROUTE} />}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Plus className="size-4" />
            Nueva compra
          </Button>
        ) : null}
      </div>

      <PurchaseTable purchases={purchases} isLoading={isLoading} />
    </div>
  );
}
