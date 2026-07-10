"use client";

import { useAtom } from "jotai";
import { useMemo, useState } from "react";

import { purchasesAtom } from "@/lib/atoms/purchases.atom";
import type { Purchase, PurchaseItem, PurchasePayment } from "@/lib/mocks/purchases.mock";
import type { PaymentMethod } from "@/lib/payment-method";
import { getPurchaseStatus, type PurchaseStatus } from "@/lib/purchase-helpers";

export const ALL_PURCHASE_STATUSES_OPTION = "all";

export interface PurchaseFilterState {
  searchTerm: string;
  status: PurchaseStatus | typeof ALL_PURCHASE_STATUSES_OPTION;
  dateFrom: string;
  dateTo: string;
}

export interface PurchaseItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitCostBOB: number;
}

export interface PurchasePaymentInput {
  amountBOB: number;
  method: PaymentMethod;
  accountDestination: string;
}

export interface PurchaseInput {
  supplierId: string;
  supplierName: string;
  date: string;
  invoiceNumber: string;
  notes: string;
  items: PurchaseItemInput[];
}

const DEFAULT_FILTERS: PurchaseFilterState = {
  searchTerm: "",
  status: ALL_PURCHASE_STATUSES_OPTION,
  dateFrom: "",
  dateTo: "",
};

const CODE_PREFIX = "COM";
const CODE_SEQUENCE_LENGTH = 4;

function generatePurchaseCode(purchases: Purchase[]): string {
  const matchingNumbers = purchases
    .filter((purchase) => purchase.code.startsWith(`${CODE_PREFIX}-`))
    .map((purchase) => Number(purchase.code.slice(CODE_PREFIX.length + 1)))
    .filter((value) => !Number.isNaN(value));

  const nextNumber = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) + 1 : 1;

  return `${CODE_PREFIX}-${String(nextNumber).padStart(CODE_SEQUENCE_LENGTH, "0")}`;
}

function toPurchaseItem(input: PurchaseItemInput): PurchaseItem {
  return { ...input, id: crypto.randomUUID() };
}

function toPurchasePayment(input: PurchasePaymentInput, date: string): PurchasePayment {
  return { ...input, id: crypto.randomUUID(), date };
}

interface UsePurchasesResult {
  purchases: Purchase[];
  filters: PurchaseFilterState;
  setFilters: (filters: Partial<PurchaseFilterState>) => void;
  createPurchase: (input: PurchaseInput) => Purchase;
  getPurchaseById: (purchaseId: string) => Purchase | undefined;
  addPayment: (purchaseId: string, payment: PurchasePaymentInput) => void;
}

export function usePurchases(): UsePurchasesResult {
  const [allPurchases, setAllPurchases] = useAtom(purchasesAtom);
  const [filters, setFiltersState] = useState<PurchaseFilterState>(DEFAULT_FILTERS);

  const setFilters = (partialFilters: Partial<PurchaseFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...partialFilters }));
  };

  const filteredPurchases = useMemo(() => {
    const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase();

    return allPurchases.filter((purchase) => {
      if (
        filters.status !== ALL_PURCHASE_STATUSES_OPTION &&
        getPurchaseStatus(purchase) !== filters.status
      ) {
        return false;
      }

      if (filters.dateFrom && purchase.date < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && purchase.date > filters.dateTo) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      return purchase.supplierName.toLowerCase().includes(normalizedSearchTerm);
    });
  }, [allPurchases, filters]);

  const getPurchaseById = (purchaseId: string) =>
    allPurchases.find((purchase) => purchase.id === purchaseId);

  const createPurchase = (input: PurchaseInput): Purchase => {
    const newPurchase: Purchase = {
      id: crypto.randomUUID(),
      code: generatePurchaseCode(allPurchases),
      date: input.date,
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      invoiceNumber: input.invoiceNumber,
      notes: input.notes,
      items: input.items.map(toPurchaseItem),
      payments: [],
    };

    setAllPurchases((previous) => [newPurchase, ...previous]);
    return newPurchase;
  };

  const addPayment = (purchaseId: string, payment: PurchasePaymentInput) => {
    const today = new Date().toISOString().slice(0, 10);

    setAllPurchases((previous) =>
      previous.map((purchase) =>
        purchase.id === purchaseId
          ? { ...purchase, payments: [...purchase.payments, toPurchasePayment(payment, today)] }
          : purchase,
      ),
    );
  };

  return {
    purchases: filteredPurchases,
    filters,
    setFilters,
    createPurchase,
    getPurchaseById,
    addPayment,
  };
}
