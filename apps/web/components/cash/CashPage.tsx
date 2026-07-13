"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useAtomValue } from "jotai";

import { useCash } from "@/hooks/use-cash";
import { useSuppliers } from "@/hooks/use-suppliers";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { hasModulePermission } from "@/lib/permission-helpers";

import { AccountsPayableTab } from "./AccountsPayableTab";
import { CashTab } from "./CashTab";

const CASH_MODULE = "cash";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";

export function CashPage() {
  const authUser = useAtomValue(authUserAtom);
  const canViewCash = hasModulePermission(authUser, CASH_MODULE, "canView");
  const canCreateCash = hasModulePermission(authUser, CASH_MODULE, "canCreate");
  const canEditCash = hasModulePermission(authUser, CASH_MODULE, "canEdit");
  const isAdmin = authUser?.role === "admin";

  const cash = useCash();
  const { suppliers } = useSuppliers();

  if (!canViewCash) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  return (
    <Tabs defaultValue="cash">
      <TabsList>
        <TabsTrigger value="cash">Caja</TabsTrigger>
        <TabsTrigger value="payable">Cuentas por pagar</TabsTrigger>
      </TabsList>

      <TabsContent value="cash" className="flex flex-col gap-6">
        <CashTab
          session={cash.session}
          onOpenSession={cash.openSession}
          onCloseSession={cash.closeSession}
          entries={cash.entries}
          destinationBalances={cash.destinationBalances}
          totalCashBalanceBOB={cash.totalCashBalanceBOB}
          entryFilters={cash.entryFilters}
          onEntryFiltersChange={cash.setEntryFilters}
          onAddEntry={cash.addCashEntry}
          onCancelEntry={cash.cancelEntry}
          onAddPartnerDistribution={cash.addPartnerDistribution}
          canCreate={canCreateCash}
          canCancel={isAdmin}
        />
      </TabsContent>

      <TabsContent value="payable" className="flex flex-col gap-6">
        <AccountsPayableTab
          payables={cash.payables}
          filters={cash.payableFilters}
          onFiltersChange={cash.setPayableFilters}
          suppliers={suppliers}
          onCreatePayable={cash.createPayable}
          onAddPayment={cash.addPayablePayment}
          canCreate={canCreateCash}
          canEdit={canEditCash}
        />
      </TabsContent>
    </Tabs>
  );
}
