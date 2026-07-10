"use client";

import { useAtom } from "jotai";
import { useMemo, useState } from "react";

import { salesAtom } from "@/lib/atoms/sales.atom";
import {
  type Sale,
  type SaleItem,
  type SalePayment,
  type SaleType,
} from "@/lib/mocks/sales.mock";
import type { PaymentMethod } from "@/lib/payment-method";

export const ALL_SALE_TYPES_OPTION = "all";

export interface SaleFilterState {
  searchTerm: string;
  type: SaleType | typeof ALL_SALE_TYPES_OPTION;
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
  clientName: string;
  type: SaleType;
  date: string;
  notes: string;
  items: SaleItemInput[];
  payments: SalePaymentInput[];
}

const DEFAULT_FILTERS: SaleFilterState = {
  searchTerm: "",
  type: ALL_SALE_TYPES_OPTION,
  dateFrom: "",
  dateTo: "",
};

const SALE_TYPE_CODE_PREFIXES: Record<SaleType, string> = {
  quotation: "COT",
  order: "PED",
  sale: "VTA",
  return: "DEV",
};

const CODE_SEQUENCE_LENGTH = 4;

function generateSaleCode(sales: Sale[], type: SaleType): string {
  const prefix = SALE_TYPE_CODE_PREFIXES[type];
  const matchingNumbers = sales
    .filter((sale) => sale.code.startsWith(`${prefix}-`))
    .map((sale) => Number(sale.code.slice(prefix.length + 1)))
    .filter((value) => !Number.isNaN(value));

  const nextNumber = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) + 1 : 1;

  return `${prefix}-${String(nextNumber).padStart(CODE_SEQUENCE_LENGTH, "0")}`;
}

function toSaleItem(input: SaleItemInput): SaleItem {
  return { ...input, id: crypto.randomUUID() };
}

function toSalePayment(input: SalePaymentInput, date: string): SalePayment {
  return { ...input, id: crypto.randomUUID(), date };
}

interface UseSalesResult {
  sales: Sale[];
  filters: SaleFilterState;
  setFilters: (filters: Partial<SaleFilterState>) => void;
  createSale: (input: SaleInput) => Sale;
  getSaleById: (saleId: string) => Sale | undefined;
  addPayment: (saleId: string, payment: SalePaymentInput) => void;
}

export function useSales(): UseSalesResult {
  const [allSales, setAllSales] = useAtom(salesAtom);
  const [filters, setFiltersState] = useState<SaleFilterState>(DEFAULT_FILTERS);

  const setFilters = (partialFilters: Partial<SaleFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...partialFilters }));
  };

  const filteredSales = useMemo(() => {
    const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase();

    return allSales.filter((sale) => {
      if (filters.type !== ALL_SALE_TYPES_OPTION && sale.type !== filters.type) {
        return false;
      }

      if (filters.dateFrom && sale.date < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && sale.date > filters.dateTo) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      return sale.clientName.toLowerCase().includes(normalizedSearchTerm);
    });
  }, [allSales, filters]);

  const getSaleById = (saleId: string) => allSales.find((sale) => sale.id === saleId);

  const createSale = (input: SaleInput): Sale => {
    const newSale: Sale = {
      id: crypto.randomUUID(),
      code: generateSaleCode(allSales, input.type),
      date: input.date,
      clientId: input.clientId,
      clientName: input.clientName,
      type: input.type,
      notes: input.notes,
      items: input.items.map(toSaleItem),
      payments: input.payments.map((payment) => toSalePayment(payment, input.date)),
    };

    setAllSales((previous) => [newSale, ...previous]);
    return newSale;
  };

  const addPayment = (saleId: string, payment: SalePaymentInput) => {
    const today = new Date().toISOString().slice(0, 10);

    setAllSales((previous) =>
      previous.map((sale) =>
        sale.id === saleId
          ? { ...sale, payments: [...sale.payments, toSalePayment(payment, today)] }
          : sale,
      ),
    );
  };

  return {
    sales: filteredSales,
    filters,
    setFilters,
    createSale,
    getSaleById,
    addPayment,
  };
}
