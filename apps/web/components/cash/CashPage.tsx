"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

import { useCash } from "@/hooks/use-cash";
import { useSuppliers } from "@/hooks/use-suppliers";

import { AccountsPayableTab } from "./AccountsPayableTab";
import { CashTab } from "./CashTab";

export function CashPage() {
  const cash = useCash();
  const { suppliers } = useSuppliers();

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
          allEntries={cash.allEntries}
          entryFilters={cash.entryFilters}
          onEntryFiltersChange={cash.setEntryFilters}
          onAddEntry={cash.addCashEntry}
          onAddPartnerDistribution={cash.addPartnerDistribution}
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
        />
      </TabsContent>
    </Tabs>
  );
}
