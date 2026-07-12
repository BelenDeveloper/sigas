import type { PaymentMethod, Purchase, PurchaseItem, PurchasePayment, PurchaseStatus } from "@repo/db";

export type { Purchase, PurchaseItem, PurchasePayment };

export interface PurchaseListItem extends Purchase {
  supplierName: string | null;
  itemCount: number;
  totalPaid: number;
  totalPending: number;
}

export interface PurchaseItemWithProduct extends PurchaseItem {
  productName: string;
  productSku: string;
}

export interface PurchaseWithRelations extends Purchase {
  items: PurchaseItemWithProduct[];
  payments: PurchasePayment[];
  totalPaid: number;
  totalPending: number;
}

export interface PurchaseBalance {
  total: number;
  totalPaid: number;
  totalPending: number;
}

export interface PurchaseFilters {
  supplierId?: string;
  status?: PurchaseStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreatePurchaseItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}

export interface CreatePurchaseInput {
  supplierId?: string;
  companyId?: string;
  invoiceNumber?: string;
  purchaseDate?: string;
  notes?: string;
  items: CreatePurchaseItemInput[];
}

export interface AddPurchasePaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  accountDestination?: string;
  notes?: string;
}

export class PurchaseNotFoundError extends Error {
  constructor(purchaseId: string) {
    super(`Purchase not found: ${purchaseId}`);
    this.name = "PurchaseNotFoundError";
  }
}

export class EmptyPurchaseError extends Error {
  constructor() {
    super("A purchase must have at least one item");
    this.name = "EmptyPurchaseError";
  }
}
