"use client";

import { useMemo, useState } from "react";

import {
  MOCK_CASH_ENTRIES,
  MOCK_CASH_SESSION,
  MOCK_PAYABLES,
  type CashEntry,
  type CashEntryCategory,
  type CashEntryType,
  type CashSession,
  type CreditorType,
  type Payable,
  type PayablePayment,
} from "@/lib/mocks/cash.mock";
import type { PaymentMethod } from "@/lib/payment-method";
import { getPayableStatus } from "@/lib/payable-helpers";

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
  status: ReturnType<typeof getPayableStatus> | typeof ALL_PAYABLE_STATUSES_OPTION;
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

function nowISO(): string {
  return new Date().toISOString();
}

interface UseCashResult {
  session: CashSession;
  openSession: () => void;
  closeSession: (closingAmountBOB: number) => void;
  entries: CashEntry[];
  allEntries: CashEntry[];
  entryFilters: CashEntryFilterState;
  setEntryFilters: (filters: Partial<CashEntryFilterState>) => void;
  addCashEntry: (input: CashEntryInput) => void;
  addPartnerDistribution: (input: PartnerDistributionInput) => void;
  payables: Payable[];
  payableFilters: PayableFilterState;
  setPayableFilters: (filters: Partial<PayableFilterState>) => void;
  createPayable: (input: PayableInput) => void;
  addPayablePayment: (payableId: string, payment: PayablePaymentInput) => void;
}

export function useCash(): UseCashResult {
  const [session, setSession] = useState<CashSession>(MOCK_CASH_SESSION);
  const [entries, setEntries] = useState<CashEntry[]>(MOCK_CASH_ENTRIES);
  const [payables, setPayables] = useState<Payable[]>(MOCK_PAYABLES);
  const [entryFilters, setEntryFiltersState] =
    useState<CashEntryFilterState>(DEFAULT_CASH_ENTRY_FILTERS);
  const [payableFilters, setPayableFiltersState] =
    useState<PayableFilterState>(DEFAULT_PAYABLE_FILTERS);

  const setEntryFilters = (filters: Partial<CashEntryFilterState>) => {
    setEntryFiltersState((previous) => ({ ...previous, ...filters }));
  };

  const setPayableFilters = (filters: Partial<PayableFilterState>) => {
    setPayableFiltersState((previous) => ({ ...previous, ...filters }));
  };

  const openSession = () => {
    setSession({
      id: crypto.randomUUID(),
      isOpen: true,
      openedAt: nowISO(),
      closedAt: null,
      closingAmountBOB: null,
    });
  };

  const closeSession = (closingAmountBOB: number) => {
    setSession((previous) => ({
      ...previous,
      isOpen: false,
      closedAt: nowISO(),
      closingAmountBOB,
    }));
  };

  const addCashEntry = (input: CashEntryInput) => {
    const newEntry: CashEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: nowISO(),
      isCancelled: false,
    };

    setEntries((previous) => [newEntry, ...previous]);
  };

  const addPartnerDistribution = (input: PartnerDistributionInput) => {
    addCashEntry({
      type: "expense",
      category: "partner_distribution",
      description: `Distribución a socio: ${input.partnerName}`,
      method: input.method,
      accountDestination: input.accountDestination,
      amountBOB: input.amountBOB,
    });
  };

  const createPayable = (input: PayableInput) => {
    const newPayable: Payable = {
      ...input,
      id: crypto.randomUUID(),
      payments: [],
    };

    setPayables((previous) => [newPayable, ...previous]);
  };

  const addPayablePayment = (payableId: string, payment: PayablePaymentInput) => {
    const newPayment: PayablePayment = {
      id: crypto.randomUUID(),
      date: payment.date,
      amountBOB: payment.amountBOB,
      method: payment.method,
      destination: payment.destination,
    };

    setPayables((previous) =>
      previous.map((payable) =>
        payable.id === payableId
          ? { ...payable, payments: [...payable.payments, newPayment] }
          : payable,
      ),
    );
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (entryFilters.type !== ALL_CASH_ENTRY_TYPES_OPTION && entry.type !== entryFilters.type) {
        return false;
      }

      if (
        entryFilters.category !== ALL_CASH_ENTRY_CATEGORIES_OPTION &&
        entry.category !== entryFilters.category
      ) {
        return false;
      }

      if (
        entryFilters.method !== ALL_PAYMENT_METHODS_OPTION &&
        entry.method !== entryFilters.method
      ) {
        return false;
      }

      if (entryFilters.date && !entry.createdAt.startsWith(entryFilters.date)) {
        return false;
      }

      return true;
    });
  }, [entries, entryFilters]);

  const filteredPayables = useMemo(() => {
    return payables.filter((payable) => {
      if (
        payableFilters.creditorType !== ALL_CREDITOR_TYPES_OPTION &&
        payable.creditorType !== payableFilters.creditorType
      ) {
        return false;
      }

      if (
        payableFilters.status !== ALL_PAYABLE_STATUSES_OPTION &&
        getPayableStatus(payable) !== payableFilters.status
      ) {
        return false;
      }

      return true;
    });
  }, [payables, payableFilters]);

  return {
    session,
    openSession,
    closeSession,
    entries: filteredEntries,
    allEntries: entries,
    entryFilters,
    setEntryFilters,
    addCashEntry,
    addPartnerDistribution,
    payables: filteredPayables,
    payableFilters,
    setPayableFilters,
    createPayable,
    addPayablePayment,
  };
}
