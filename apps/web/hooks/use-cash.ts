"use client";

import { useMemo, useState } from "react";

import type { CashEntryCategory, CashEntryType, CreditorType, PayableStatus } from "@/lib/cash-types";
import type { PaymentMethod } from "@/lib/payment-method";
import { trpc } from "@/lib/trpc/client";

export const ALL_CASH_ENTRY_TYPES_OPTION = "all";
export const ALL_CASH_ENTRY_CATEGORIES_OPTION = "all";
export const ALL_PAYMENT_METHODS_OPTION = "all";
export const ALL_CREDITOR_TYPES_OPTION = "all";
export const ALL_PAYABLE_STATUSES_OPTION = "all";

export interface CashEntryFilterState {
  type: CashEntryType | typeof ALL_CASH_ENTRY_TYPES_OPTION;
  category: CashEntryCategory | typeof ALL_CASH_ENTRY_CATEGORIES_OPTION;
  method: PaymentMethod | typeof ALL_PAYMENT_METHODS_OPTION;
  date: string;
}

export interface CashEntryInput {
  type: CashEntryType;
  category: CashEntryCategory;
  description: string;
  method: PaymentMethod;
  accountDestination: string;
  amountBOB: number;
}

export interface PartnerDistributionInput {
  partnerName: string;
  amountBOB: number;
  method: PaymentMethod;
  accountDestination: string;
}

export interface PayableFilterState {
  creditorType: CreditorType | typeof ALL_CREDITOR_TYPES_OPTION;
  status: PayableStatus | typeof ALL_PAYABLE_STATUSES_OPTION;
}

export interface PayableInput {
  creditorType: CreditorType;
  creditorName: string;
  supplierId: string | null;
  amountBOB: number;
  dueDate: string;
  category: string;
  invoiceNumber: string;
  notes: string;
}

export interface PayablePaymentInput {
  amountBOB: number;
  method: PaymentMethod;
  destination: string;
  date: string;
}

export interface CashSessionView {
  id: string;
  isOpen: boolean;
  openedAt: string;
  closedAt: string | null;
  closingAmountBOB: number | null;
}

export interface CashEntryView {
  id: string;
  createdAt: string;
  type: CashEntryType;
  category: CashEntryCategory;
  description: string;
  method: PaymentMethod;
  accountDestination: string;
  amountBOB: number;
  isCancelled: boolean;
}

export interface DestinationBalance {
  destination: string;
  balanceBOB: number;
}

export interface PayableView {
  id: string;
  creditorType: CreditorType;
  creditorName: string;
  supplierId: string | null;
  amountBOB: number;
  paidBOB: number;
  pendingBOB: number;
  status: PayableStatus;
  dueDate: string;
  category: string;
  invoiceNumber: string;
  notes: string;
}

export interface PayablePaymentView {
  id: string;
  date: string;
  amountBOB: number;
  method: PaymentMethod;
  destination: string;
}

const DEFAULT_CASH_ENTRY_FILTERS: CashEntryFilterState = {
  type: ALL_CASH_ENTRY_TYPES_OPTION,
  category: ALL_CASH_ENTRY_CATEGORIES_OPTION,
  method: ALL_PAYMENT_METHODS_OPTION,
  date: "",
};

const DEFAULT_PAYABLE_FILTERS: PayableFilterState = {
  creditorType: ALL_CREDITOR_TYPES_OPTION,
  status: ALL_PAYABLE_STATUSES_OPTION,
};

function toSession(session: {
  id: string;
  status: string;
  openedAt: Date | string;
  closedAt: Date | string | null;
  closingAmount: string | null;
}): CashSessionView {
  return {
    id: session.id,
    isOpen: session.status === "open",
    openedAt: String(session.openedAt),
    closedAt: session.closedAt ? String(session.closedAt) : null,
    closingAmountBOB: session.closingAmount !== null ? Number(session.closingAmount) : null,
  };
}

function toEntry(entry: {
  id: string;
  createdAt: Date | string;
  type: string;
  category: string;
  description: string;
  paymentMethod: string;
  accountDestination: string | null;
  amount: string;
  cancelled: boolean;
}): CashEntryView {
  return {
    id: entry.id,
    createdAt: String(entry.createdAt),
    type: entry.type as CashEntryType,
    category: entry.category as CashEntryCategory,
    description: entry.description,
    method: entry.paymentMethod as PaymentMethod,
    accountDestination: entry.accountDestination ?? "",
    amountBOB: Number(entry.amount),
    isCancelled: entry.cancelled,
  };
}

function toPayable(payable: {
  id: string;
  creditorType: string;
  creditorName: string;
  supplierId: string | null;
  amount: string;
  paidAmount: string;
  status: string;
  dueDate: string | null;
  category: string | null;
  invoiceNumber: string | null;
  notes: string | null;
}): PayableView {
  const amountBOB = Number(payable.amount);
  const paidBOB = Number(payable.paidAmount);

  return {
    id: payable.id,
    creditorType: payable.creditorType as CreditorType,
    creditorName: payable.creditorName,
    supplierId: payable.supplierId,
    amountBOB,
    paidBOB,
    pendingBOB: amountBOB - paidBOB,
    status: payable.status as PayableStatus,
    dueDate: payable.dueDate ?? "",
    category: payable.category ?? "",
    invoiceNumber: payable.invoiceNumber ?? "",
    notes: payable.notes ?? "",
  };
}

interface UseCashResult {
  session: CashSessionView | null;
  openSession: () => void;
  closeSession: (closingAmountBOB: number) => void;
  entries: CashEntryView[];
  destinationBalances: DestinationBalance[];
  totalCashBalanceBOB: number;
  entryFilters: CashEntryFilterState;
  setEntryFilters: (filters: Partial<CashEntryFilterState>) => void;
  addCashEntry: (input: CashEntryInput) => void;
  cancelEntry: (entryId: string) => void;
  addPartnerDistribution: (input: PartnerDistributionInput) => void;
  isLoading: boolean;
  payables: PayableView[];
  payableFilters: PayableFilterState;
  setPayableFilters: (filters: Partial<PayableFilterState>) => void;
  createPayable: (input: PayableInput) => void;
  addPayablePayment: (payableId: string, payment: PayablePaymentInput) => void;
  isLoadingPayables: boolean;
}

export function useCash(): UseCashResult {
  const utils = trpc.useUtils();

  const { data: rawSession } = trpc.cash.getCurrentSession.useQuery();
  const session = useMemo(() => (rawSession ? toSession(rawSession) : null), [rawSession]);

  const [entryFilters, setEntryFiltersState] = useState<CashEntryFilterState>(DEFAULT_CASH_ENTRY_FILTERS);
  const [payableFilters, setPayableFiltersState] = useState<PayableFilterState>(DEFAULT_PAYABLE_FILTERS);

  const setEntryFilters = (filters: Partial<CashEntryFilterState>) => {
    setEntryFiltersState((previous) => ({ ...previous, ...filters }));
  };

  const setPayableFilters = (filters: Partial<PayableFilterState>) => {
    setPayableFiltersState((previous) => ({ ...previous, ...filters }));
  };

  const { data: rawEntries } = trpc.cash.listEntries.useQuery(
    { sessionId: session?.id },
    { enabled: session !== null },
  );

  const { data: rawWhereIsTheMoney } = trpc.cash.getWhereIsTheMoney.useQuery({});
  const { data: rawPayables } = trpc.cash.listPayables.useQuery({});

  const invalidateSession = () => void utils.cash.getCurrentSession.invalidate();

  const invalidateEntries = () => {
    void utils.cash.listEntries.invalidate();
    void utils.cash.getWhereIsTheMoney.invalidate();
  };

  const invalidatePayables = () => {
    void utils.cash.listPayables.invalidate();
    invalidateEntries();
  };

  const openSessionMutation = trpc.cash.openSession.useMutation({ onSuccess: invalidateSession });
  const closeSessionMutation = trpc.cash.closeSession.useMutation({ onSuccess: invalidateSession });
  const addEntryMutation = trpc.cash.addEntry.useMutation({ onSuccess: invalidateEntries });
  const cancelEntryMutation = trpc.cash.cancelEntry.useMutation({ onSuccess: invalidateEntries });
  const addPartnerDistributionMutation = trpc.cash.addPartnerDistribution.useMutation({
    onSuccess: invalidateEntries,
  });
  const createPayableMutation = trpc.cash.createPayable.useMutation({ onSuccess: invalidatePayables });
  const addPayablePaymentMutation = trpc.cash.addPayablePayment.useMutation({
    onSuccess: invalidatePayables,
  });

  const allEntries = useMemo(() => (rawEntries ?? []).map(toEntry), [rawEntries]);

  const entries = useMemo(
    () =>
      allEntries.filter((entry) => {
        if (entryFilters.type !== ALL_CASH_ENTRY_TYPES_OPTION && entry.type !== entryFilters.type) {
          return false;
        }

        if (
          entryFilters.category !== ALL_CASH_ENTRY_CATEGORIES_OPTION &&
          entry.category !== entryFilters.category
        ) {
          return false;
        }

        if (entryFilters.method !== ALL_PAYMENT_METHODS_OPTION && entry.method !== entryFilters.method) {
          return false;
        }

        if (entryFilters.date && !entry.createdAt.startsWith(entryFilters.date)) {
          return false;
        }

        return true;
      }),
    [allEntries, entryFilters],
  );

  const destinationBalances = useMemo<DestinationBalance[]>(
    () => (rawWhereIsTheMoney ?? []).map((row) => ({ destination: row.destination, balanceBOB: row.total })),
    [rawWhereIsTheMoney],
  );

  const totalCashBalanceBOB = useMemo(
    () => destinationBalances.reduce((sum, balance) => sum + balance.balanceBOB, 0),
    [destinationBalances],
  );

  const payables = useMemo(() => {
    const mapped = (rawPayables ?? []).map(toPayable);

    return mapped.filter((payable) => {
      if (
        payableFilters.creditorType !== ALL_CREDITOR_TYPES_OPTION &&
        payable.creditorType !== payableFilters.creditorType
      ) {
        return false;
      }

      if (payableFilters.status !== ALL_PAYABLE_STATUSES_OPTION && payable.status !== payableFilters.status) {
        return false;
      }

      return true;
    });
  }, [rawPayables, payableFilters]);

  const openSession = () => {
    openSessionMutation.mutate();
  };

  const closeSession = (closingAmountBOB: number) => {
    if (!session) {
      return;
    }

    closeSessionMutation.mutate({ sessionId: session.id, closingAmount: closingAmountBOB });
  };

  const addCashEntry = (input: CashEntryInput) => {
    addEntryMutation.mutate({
      type: input.type,
      category: input.category,
      description: input.description,
      paymentMethod: input.method,
      accountDestination: input.accountDestination,
      amount: input.amountBOB,
    });
  };

  const cancelEntry = (entryId: string) => {
    cancelEntryMutation.mutate({ id: entryId });
  };

  const addPartnerDistribution = (input: PartnerDistributionInput) => {
    addPartnerDistributionMutation.mutate({
      partnerName: input.partnerName,
      amount: input.amountBOB,
      paymentMethod: input.method,
      accountDestination: input.accountDestination,
    });
  };

  const createPayable = (input: PayableInput) => {
    createPayableMutation.mutate({
      creditorType: input.creditorType,
      supplierId: input.supplierId ?? undefined,
      creditorName: input.creditorName,
      amount: input.amountBOB,
      dueDate: input.dueDate || undefined,
      category: input.category || undefined,
      invoiceNumber: input.invoiceNumber || undefined,
      notes: input.notes || undefined,
    });
  };

  const addPayablePayment = (payableId: string, payment: PayablePaymentInput) => {
    addPayablePaymentMutation.mutate({
      payableId,
      amount: payment.amountBOB,
      paymentMethod: payment.method,
      destination: payment.destination || undefined,
    });
  };

  return {
    session,
    openSession,
    closeSession,
    entries,
    destinationBalances,
    totalCashBalanceBOB,
    entryFilters,
    setEntryFilters,
    addCashEntry,
    cancelEntry,
    addPartnerDistribution,
    isLoading: rawEntries === undefined,
    payables,
    payableFilters,
    setPayableFilters,
    createPayable,
    addPayablePayment,
    isLoadingPayables: rawPayables === undefined,
  };
}

export function usePayablePayments(payableId: string | null): PayablePaymentView[] {
  const { data } = trpc.cash.getPayablePayments.useQuery(
    { payableId: payableId ?? "" },
    { enabled: payableId !== null },
  );

  return useMemo<PayablePaymentView[]>(
    () =>
      (data ?? []).map((payment) => ({
        id: payment.id,
        date: String(payment.paidAt),
        amountBOB: Number(payment.amount),
        method: payment.paymentMethod as PaymentMethod,
        destination: payment.destination ?? "",
      })),
    [data],
  );
}
