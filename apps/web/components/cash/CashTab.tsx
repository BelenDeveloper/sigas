"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useState } from "react";

import type {
  CashEntryFilterState,
  CashEntryInput,
  PartnerDistributionInput,
} from "@/hooks/use-cash";
import type { CashEntry, CashSession } from "@/lib/mocks/cash.mock";

import { AddCashEntryDialog } from "./AddCashEntryDialog";
import { CashEntryFilters } from "./CashEntryFilters";
import { CashEntryTable } from "./CashEntryTable";
import { CashSessionHeader } from "./CashSessionHeader";
import { PartnerDistributionDialog } from "./PartnerDistributionDialog";
import { WhereIsTheMoneyCard } from "./WhereIsTheMoneyCard";

interface CashTabProps {
  session: CashSession;
  onOpenSession: () => void;
  onCloseSession: (closingAmountBOB: number) => void;
  entries: CashEntry[];
  allEntries: CashEntry[];
  entryFilters: CashEntryFilterState;
  onEntryFiltersChange: (filters: Partial<CashEntryFilterState>) => void;
  onAddEntry: (input: CashEntryInput) => void;
  onAddPartnerDistribution: (input: PartnerDistributionInput) => void;
}

export function CashTab({
  session,
  onOpenSession,
  onCloseSession,
  entries,
  allEntries,
  entryFilters,
  onEntryFiltersChange,
  onAddEntry,
  onAddPartnerDistribution,
}: CashTabProps) {
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <CashSessionHeader session={session} onOpenSession={onOpenSession} onCloseSession={onCloseSession} />

      <WhereIsTheMoneyCard entries={allEntries} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <CashEntryFilters filters={entryFilters} onFiltersChange={onEntryFiltersChange} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPartnerDialogOpen(true)}>
            <Users className="size-4" />
            Distribución a socio
          </Button>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setIsAddEntryDialogOpen(true)}
          >
            <Plus className="size-4" />
            Nuevo movimiento
          </Button>
        </div>
      </div>

      <CashEntryTable entries={entries} />

      <AddCashEntryDialog
        open={isAddEntryDialogOpen}
        onOpenChange={setIsAddEntryDialogOpen}
        onCreate={onAddEntry}
      />

      <PartnerDistributionDialog
        open={isPartnerDialogOpen}
        onOpenChange={setIsPartnerDialogOpen}
        onCreate={onAddPartnerDistribution}
      />
    </div>
  );
}
