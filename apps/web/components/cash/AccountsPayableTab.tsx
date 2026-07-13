"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

import type { PayableFilterState, PayableInput, PayablePaymentInput, PayableView } from "@/hooks/use-cash";
import type { Supplier } from "@/lib/supplier-types";

import { AddPayableDialog } from "./AddPayableDialog";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { PayableFilters } from "./PayableFilters";
import { PayableTable } from "./PayableTable";

interface AccountsPayableTabProps {
  payables: PayableView[];
  filters: PayableFilterState;
  onFiltersChange: (filters: Partial<PayableFilterState>) => void;
  suppliers: Supplier[];
  onCreatePayable: (input: PayableInput) => void;
  onAddPayment: (payableId: string, payment: PayablePaymentInput) => void;
  canCreate: boolean;
  canEdit: boolean;
}

export function AccountsPayableTab({
  payables,
  filters,
  onFiltersChange,
  suppliers,
  onCreatePayable,
  onAddPayment,
  canCreate,
  canEdit,
}: AccountsPayableTabProps) {
  const [isPayableDialogOpen, setIsPayableDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [payableForPayment, setPayableForPayment] = useState<PayableView | null>(null);

  const handleAddPayment = (payable: PayableView) => {
    setPayableForPayment(payable);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PayableFilters filters={filters} onFiltersChange={onFiltersChange} />
        {canCreate ? (
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setIsPayableDialogOpen(true)}
          >
            <Plus className="size-4" />
            Nueva cuenta por pagar
          </Button>
        ) : null}
      </div>

      <PayableTable payables={payables} canAddPayment={canEdit} onAddPayment={handleAddPayment} />

      <AddPayableDialog
        open={isPayableDialogOpen}
        onOpenChange={setIsPayableDialogOpen}
        suppliers={suppliers}
        onCreate={onCreatePayable}
      />

      <AddPaymentDialog
        payable={payableForPayment}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onConfirm={onAddPayment}
      />
    </div>
  );
}
