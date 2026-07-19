"use client";

import { useMemo, useState } from "react";

import type { PaymentMethod } from "@/lib/payment-method";
import type { SaleStatus, SaleType } from "@/lib/sale-types";
import { trpc } from "@/lib/trpc/client";

export const ALL_SALE_TYPES_OPTION = "all";
export const ALL_SALE_STATUSES_OPTION = "all";

export interface SaleFilterState {
  searchTerm: string;
  type: SaleType | typeof ALL_SALE_TYPES_OPTION;
  status: SaleStatus | typeof ALL_SALE_STATUSES_OPTION;
  dateFrom: string;
  dateTo: string;
}

export interface SaleItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceBOB: number;
}

export interface SalePaymentInput {
  amountBOB: number;
  method: PaymentMethod;
  accountDestination: string;
}

export interface SaleInput {
  clientId: string;
  type: SaleType;
  date: string;
  notes: string;
  discountBOB: number;
  items: SaleItemInput[];
  payments: SalePaymentInput[];
}

export interface SaleListItem {
  id: string;
  code: string;
  date: string;
  clientId: string | null;
  clientName: string;
  type: SaleType;
  status: SaleStatus;
  itemCount: number;
  totalBOB: number;
  paidBOB: number;
  pendingBOB: number;
}

export interface SaleItemDetail {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPriceBOB: number;
  subtotalBOB: number;
  notes: string;
}

export interface SalePaymentDetail {
  id: string;
  amountBOB: number;
  paymentMethod: PaymentMethod;
  accountDestination: string;
  paidAt: string;
  notes: string;
}

export interface SaleEditEntry {
  id: string;
  editedByName: string;
  editedAt: string;
  notes: string;
}

export interface SaleDetail {
  id: string;
  code: string;
  type: SaleType;
  status: SaleStatus;
  clientId: string | null;
  saleDate: string;
  notes: string;
  subtotalBOB: number;
  discountBOB: number;
  totalBOB: number;
  paidBOB: number;
  pendingBOB: number;
  items: SaleItemDetail[];
  payments: SalePaymentDetail[];
  edits: SaleEditEntry[];
}

export interface UpdateSaleInput {
  discountBOB: number;
  items: SaleItemInput[];
  editNote: string;
}

const DEFAULT_FILTERS: SaleFilterState = {
  searchTerm: "",
  type: ALL_SALE_TYPES_OPTION,
  status: ALL_SALE_STATUSES_OPTION,
  dateFrom: "",
  dateTo: "",
};

function toSalePaymentMutationInput(saleId: string, payment: SalePaymentInput) {
  return {
    saleId,
    amount: payment.amountBOB,
    paymentMethod: payment.method,
    accountDestination: payment.accountDestination,
  };
}

interface UseSalesResult {
  sales: SaleListItem[];
  filters: SaleFilterState;
  setFilters: (filters: Partial<SaleFilterState>) => void;
  createSale: (input: SaleInput) => Promise<{ id: string }>;
  isLoading: boolean;
}

export function useSales(): UseSalesResult {
  const utils = trpc.useUtils();

  const [filters, setFiltersState] = useState<SaleFilterState>(DEFAULT_FILTERS);

  const setFilters = (partialFilters: Partial<SaleFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...partialFilters }));
  };

  const { data: rawSales } = trpc.sales.list.useQuery({
    search: filters.searchTerm || undefined,
    type: filters.type !== ALL_SALE_TYPES_OPTION ? filters.type : undefined,
    status: filters.status !== ALL_SALE_STATUSES_OPTION ? filters.status : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  const invalidateSales = () => void utils.sales.list.invalidate();

  const createMutation = trpc.sales.create.useMutation({ onSuccess: invalidateSales });
  const addPaymentMutation = trpc.sales.addPayment.useMutation({ onSuccess: invalidateSales });

  const sales = useMemo<SaleListItem[]>(
    () =>
      (rawSales ?? []).map((sale) => ({
        id: sale.id,
        code: sale.code,
        date: sale.saleDate,
        clientId: sale.clientId,
        clientName: sale.clientName ?? "",
        type: sale.type,
        status: sale.status,
        itemCount: sale.itemCount,
        totalBOB: Number(sale.total),
        paidBOB: sale.totalPaid,
        pendingBOB: sale.totalPending,
      })),
    [rawSales],
  );

  const createSale = async (input: SaleInput): Promise<{ id: string }> => {
    const sale = await createMutation.mutateAsync({
      type: input.type,
      clientId: input.clientId || undefined,
      saleDate: input.date || undefined,
      notes: input.notes || undefined,
      discount: input.discountBOB || undefined,
      items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPriceBOB,
      })),
    });

    for (const payment of input.payments) {
      await addPaymentMutation.mutateAsync(toSalePaymentMutationInput(sale.id, payment));
    }

    return sale;
  };

  return {
    sales,
    filters,
    setFilters,
    createSale,
    isLoading: rawSales === undefined,
  };
}

interface UseSaleResult {
  sale: SaleDetail | undefined;
  isLoading: boolean;
  addPayment: (payment: SalePaymentInput) => Promise<void>;
  cancelSale: (reason: string) => Promise<void>;
  updateSale: (input: UpdateSaleInput) => Promise<void>;
  isSubmittingPayment: boolean;
  isCancelingSale: boolean;
  isUpdatingSale: boolean;
}

export function useSale(saleId: string): UseSaleResult {
  const utils = trpc.useUtils();

  const { data: rawSale, isLoading } = trpc.sales.get.useQuery({ id: saleId });

  const invalidateSale = () => {
    void utils.sales.get.invalidate({ id: saleId });
    void utils.sales.list.invalidate();
  };

  const addPaymentMutation = trpc.sales.addPayment.useMutation({ onSuccess: invalidateSale });
  const cancelMutation = trpc.sales.cancel.useMutation({ onSuccess: invalidateSale });
  const updateMutation = trpc.sales.update.useMutation({ onSuccess: invalidateSale });

  const sale = useMemo<SaleDetail | undefined>(() => {
    if (!rawSale) {
      return undefined;
    }

    return {
      id: rawSale.id,
      code: rawSale.code,
      type: rawSale.type,
      status: rawSale.status,
      clientId: rawSale.clientId,
      saleDate: rawSale.saleDate,
      notes: rawSale.notes ?? "",
      subtotalBOB: Number(rawSale.subtotal),
      discountBOB: Number(rawSale.discount),
      totalBOB: Number(rawSale.total),
      paidBOB: rawSale.totalPaid,
      pendingBOB: rawSale.totalPending,
      items: rawSale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: Number(item.quantity),
        unitPriceBOB: Number(item.unitPrice),
        subtotalBOB: Number(item.subtotal),
        notes: item.notes ?? "",
      })),
      payments: rawSale.payments.map((payment) => ({
        id: payment.id,
        amountBOB: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        accountDestination: payment.accountDestination ?? "",
        paidAt: String(payment.paidAt),
        notes: payment.notes ?? "",
      })),
      edits: rawSale.edits.map((edit) => ({
        id: edit.id,
        editedByName: edit.editedByName ?? "",
        editedAt: String(edit.editedAt),
        notes: edit.notes,
      })),
    };
  }, [rawSale]);

  const addPayment = async (payment: SalePaymentInput) => {
    await addPaymentMutation.mutateAsync(toSalePaymentMutationInput(saleId, payment));
  };

  const cancelSale = async (reason: string) => {
    await cancelMutation.mutateAsync({ id: saleId, reason });
  };

  const updateSale = async (input: UpdateSaleInput) => {
    await updateMutation.mutateAsync({
      id: saleId,
      discount: input.discountBOB || undefined,
      items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPriceBOB,
      })),
      editNote: input.editNote,
    });
  };

  return {
    sale,
    isLoading,
    addPayment,
    cancelSale,
    updateSale,
    isSubmittingPayment: addPaymentMutation.isPending,
    isCancelingSale: cancelMutation.isPending,
    isUpdatingSale: updateMutation.isPending,
  };
}
