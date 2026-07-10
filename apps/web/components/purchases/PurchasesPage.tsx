"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

import { usePurchases } from "@/hooks/use-purchases";

import { PurchaseFilters } from "./PurchaseFilters";
import { PurchaseTable } from "./PurchaseTable";

const NEW_PURCHASE_ROUTE = "/purchases/new";

export function PurchasesPage() {
  const { purchases, filters, setFilters } = usePurchases();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PurchaseFilters filters={filters} onFiltersChange={setFilters} />
        <Button
          nativeButton={false}
          render={<Link href={NEW_PURCHASE_ROUTE} />}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" />
          Nueva compra
        </Button>
      </div>

      <PurchaseTable purchases={purchases} />
    </div>
  );
}
