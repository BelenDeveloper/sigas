import type { PaymentMethod, Sale, SaleItem, SalePayment, SaleStatus, SaleType } from "@repo/db";

export type { Sale, SaleItem, SalePayment };

export interface SaleListItem extends Sale {
  clientName: string | null;
  itemCount: number;
  totalPaid: number;
  totalPending: number;
}

export interface SaleItemWithProduct extends SaleItem {
  productName: string;
  productSku: string;
}

export interface SaleWithRelations extends Sale {
  items: SaleItemWithProduct[];
  payments: SalePayment[];
  totalPaid: number;
  totalPending: number;
}

export interface SaleBalance {
  total: number;
  totalPaid: number;
  totalPending: number;
}

export interface SaleFilters {
  clientId?: string;
  type?: SaleType;
  status?: SaleStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface CreateSaleInput {
  type: SaleType;
  clientId?: string;
  companyId?: string;
  saleDate?: string;
  notes?: string;
  discount?: number;
  items: CreateSaleItemInput[];
}

export interface AddSalePaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  accountDestination?: string;
  notes?: string;
}

export class SaleNotFoundError extends Error {
  constructor(saleId: string) {
    super(`Sale not found: ${saleId}`);
    this.name = "SaleNotFoundError";
  }
}

export class EmptySaleError extends Error {
  constructor() {
    super("A sale must have at least one item");
    this.name = "EmptySaleError";
  }
}

export class SaleAlreadyCancelledError extends Error {
  constructor(saleId: string) {
    super(`Sale is already cancelled: ${saleId}`);
    this.name = "SaleAlreadyCancelledError";
  }
}
