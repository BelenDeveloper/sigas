"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useState } from "react";

import type {
  CashEntryFilterState,
  CashEntryInput,
  CashEntryView,
  CashSessionView,
  DestinationBalance,
  PartnerDistributionInput,
} from "@/hooks/use-cash";

import { AddCashEntryDialog } from "./AddCashEntryDialog";
import { CashEntryFilters } from "./CashEntryFilters";
import { CashEntryTable } from "./CashEntryTable";
import { CashSessionHeader } from "./CashSessionHeader";
import { PartnerDistributionDialog } from "./PartnerDistributionDialog";
import { WhereIsTheMoneyCard } from "./WhereIsTheMoneyCard";

interface CashTabProps {
  session: CashSessionView | null;
  onOpenSession: () => void;
  onCloseSession: (closingAmountBOB: number) => void;
  entries: CashEntryView[];
  destinationBalances: DestinationBalance[];
  totalCashBalanceBOB: number;
  entryFilters: CashEntryFilterState;
  onEntryFiltersChange: (filters: Partial<CashEntryFilterState>) => void;
  onAddEntry: (input: CashEntryInput) => void;
  onCancelEntry: (entryId: string) => void;
  onAddPartnerDistribution: (input: PartnerDistributionInput) => void;
  canCreate: boolean;
  canCancel: boolean;
}

export function CashTab({
  session,
  onOpenSession,
  onCloseSession,
  entries,
  destinationBalances,
  totalCashBalanceBOB,
  entryFilters,
  onEntryFiltersChange,
  onAddEntry,
  onCancelEntry,
  onAddPartnerDistribution,
  canCreate,
  canCancel,
}: CashTabProps) {
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);

  const canAddMovement = canCreate && session?.isOpen === true;

  return (
    <div className="flex flex-col gap-6">
      <CashSessionHeader session={session} onOpenSession={onOpenSession} onCloseSession={onCloseSession} />

      <WhereIsTheMoneyCard destinationBalances={destinationBalances} totalBOB={totalCashBalanceBOB} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <CashEntryFilters filters={entryFilters} onFiltersChange={onEntryFiltersChange} />
        {canCreate ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!canAddMovement}
              onClick={() => setIsPartnerDialogOpen(true)}
            >
              <Users className="size-4" />
              Distribución a socio
            </Button>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={!canAddMovement}
              onClick={() => setIsAddEntryDialogOpen(true)}
            >
              <Plus className="size-4" />
              Nuevo movimiento
            </Button>
          </div>
        ) : null}
      </div>

      <CashEntryTable entries={entries} canCancel={canCancel} onCancelEntry={onCancelEntry} />

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
