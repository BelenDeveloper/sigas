"use client";

import { useMemo, useState } from "react";

import type { PaymentMethod } from "@/lib/payment-method";
import type { PurchaseStatus } from "@/lib/purchase-types";
import { trpc } from "@/lib/trpc/client";

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
  date: string;
  invoiceNumber: string;
  notes: string;
  items: PurchaseItemInput[];
}

export interface PurchaseListItem {
  id: string;
  code: string;
  date: string;
  supplierId: string | null;
  supplierName: string;
  status: PurchaseStatus;
  itemCount: number;
  totalBOB: number;
  paidBOB: number;
  pendingBOB: number;
}

export interface PurchaseItemDetail {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCostBOB: number;
  subtotalBOB: number;
  notes: string;
}

export interface PurchasePaymentDetail {
  id: string;
  amountBOB: number;
  paymentMethod: PaymentMethod;
  accountDestination: string;
  paidAt: string;
  notes: string;
}

export interface PurchaseDetail {
  id: string;
  code: string;
  status: PurchaseStatus;
  supplierId: string | null;
  invoiceNumber: string;
  purchaseDate: string;
  notes: string;
  totalBOB: number;
  paidBOB: number;
  pendingBOB: number;
  items: PurchaseItemDetail[];
  payments: PurchasePaymentDetail[];
}

const DEFAULT_FILTERS: PurchaseFilterState = {
  searchTerm: "",
  status: ALL_PURCHASE_STATUSES_OPTION,
  dateFrom: "",
  dateTo: "",
};

function toPurchasePaymentMutationInput(purchaseId: string, payment: PurchasePaymentInput) {
  return {
    purchaseId,
    amount: payment.amountBOB,
    paymentMethod: payment.method,
    accountDestination: payment.accountDestination,
  };
}

interface UsePurchasesResult {
  purchases: PurchaseListItem[];
  filters: PurchaseFilterState;
  setFilters: (filters: Partial<PurchaseFilterState>) => void;
  createPurchase: (input: PurchaseInput) => Promise<{ id: string }>;
  isLoading: boolean;
}

export function usePurchases(): UsePurchasesResult {
  const utils = trpc.useUtils();

  const [filters, setFiltersState] = useState<PurchaseFilterState>(DEFAULT_FILTERS);

  const setFilters = (partialFilters: Partial<PurchaseFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...partialFilters }));
  };

  const { data: rawPurchases } = trpc.purchases.list.useQuery({
    status: filters.status !== ALL_PURCHASE_STATUSES_OPTION ? filters.status : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  const invalidatePurchases = () => void utils.purchases.list.invalidate();

  const createMutation = trpc.purchases.create.useMutation({ onSuccess: invalidatePurchases });

  const purchases = useMemo<PurchaseListItem[]>(() => {
    const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase();

    return (rawPurchases ?? [])
      .map((purchase) => ({
        id: purchase.id,
        code: purchase.code,
        date: purchase.purchaseDate,
        supplierId: purchase.supplierId,
        supplierName: purchase.supplierName ?? "",
        status: purchase.status,
        itemCount: purchase.itemCount,
        totalBOB: Number(purchase.total),
        paidBOB: purchase.totalPaid,
        pendingBOB: purchase.totalPending,
      }))
      .filter((purchase) =>
        normalizedSearchTerm ? purchase.supplierName.toLowerCase().includes(normalizedSearchTerm) : true,
      );
  }, [rawPurchases, filters.searchTerm]);

  const createPurchase = (input: PurchaseInput): Promise<{ id: string }> => {
    return createMutation.mutateAsync({
      supplierId: input.supplierId || undefined,
      invoiceNumber: input.invoiceNumber || undefined,
      purchaseDate: input.date || undefined,
      notes: input.notes || undefined,
      items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCostBOB,
      })),
    });
  };

  return {
    purchases,
    filters,
    setFilters,
    createPurchase,
    isLoading: rawPurchases === undefined,
  };
}

interface UsePurchaseResult {
  purchase: PurchaseDetail | undefined;
  isLoading: boolean;
  addPayment: (payment: PurchasePaymentInput) => Promise<void>;
  isSubmittingPayment: boolean;
}

export function usePurchase(purchaseId: string): UsePurchaseResult {
  const utils = trpc.useUtils();

  const { data: rawPurchase, isLoading } = trpc.purchases.get.useQuery({ id: purchaseId });

  const invalidatePurchase = () => {
    void utils.purchases.get.invalidate({ id: purchaseId });
    void utils.purchases.list.invalidate();
  };

  const addPaymentMutation = trpc.purchases.addPayment.useMutation({ onSuccess: invalidatePurchase });

  const purchase = useMemo<PurchaseDetail | undefined>(() => {
    if (!rawPurchase) {
      return undefined;
    }

    return {
      id: rawPurchase.id,
      code: rawPurchase.code,
      status: rawPurchase.status,
      supplierId: rawPurchase.supplierId,
      invoiceNumber: rawPurchase.invoiceNumber ?? "",
      purchaseDate: rawPurchase.purchaseDate,
      notes: rawPurchase.notes ?? "",
      totalBOB: Number(rawPurchase.total),
      paidBOB: rawPurchase.totalPaid,
      pendingBOB: rawPurchase.totalPending,
      items: rawPurchase.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: Number(item.quantity),
        unitCostBOB: Number(item.unitCost),
        subtotalBOB: Number(item.subtotal),
        notes: item.notes ?? "",
      })),
      payments: rawPurchase.payments.map((payment) => ({
        id: payment.id,
        amountBOB: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        accountDestination: payment.accountDestination ?? "",
        paidAt: String(payment.paidAt),
        notes: payment.notes ?? "",
      })),
    };
  }, [rawPurchase]);

  const addPayment = async (payment: PurchasePaymentInput) => {
    await addPaymentMutation.mutateAsync(toPurchasePaymentMutationInput(purchaseId, payment));
  };

  return { purchase, isLoading, addPayment, isSubmittingPayment: addPaymentMutation.isPending };
}
