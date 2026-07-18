import type {
  CashEntry,
  CashEntryReferenceType,
  CashEntryType,
  CashSession,
  CreditorType,
  PartnerDistribution,
  PayableAccount,
  PayablePayment,
  PayableStatus,
  PaymentMethod,
} from "@repo/db";

export type { CashEntry, CashSession, PartnerDistribution, PayableAccount, PayablePayment };

export interface CashEntryFilters {
  sessionId?: string;
  type?: CashEntryType;
  category?: string;
  method?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AutoCashEntryInput {
  type: CashEntryType;
  category: string;
  description: string;
  paymentMethod: PaymentMethod;
  accountDestination: string;
  amount: number;
  referenceId: string;
  referenceType: CashEntryReferenceType;
  createdBy: string;
}

export interface ManualCashEntryInput {
  type: CashEntryType;
  category: string;
  description: string;
  paymentMethod: PaymentMethod;
  accountDestination?: string;
  amount: number;
}

export interface PartnerDistributionInput {
  partnerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountDestination?: string;
}

export interface WhereIsTheMoneyEntry {
  destination: string;
  total: number;
}

export interface WhereIsTheMoneyFilters {
  sessionId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DailySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface PayableFilters {
  creditorType?: CreditorType;
  status?: PayableStatus;
  search?: string;
}

export interface CreatePayableInput {
  creditorType: CreditorType;
  supplierId?: string;
  creditorName: string;
  purchaseId?: string;
  amount: number;
  dueDate?: string;
  category?: string;
  invoiceNumber?: string;
  reference?: string;
  notes?: string;
}

export interface AddPayablePaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  destination?: string;
}

export class NoOpenSessionError extends Error {
  constructor() {
    super("There is no open cash session");
    this.name = "NoOpenSessionError";
  }
}

export class SessionAlreadyOpenError extends Error {
  constructor() {
    super("A cash session is already open");
    this.name = "SessionAlreadyOpenError";
  }
}

export class CashSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Cash session not found: ${sessionId}`);
    this.name = "CashSessionNotFoundError";
  }
}

export class CashEntryNotFoundError extends Error {
  constructor(entryId: string) {
    super(`Cash entry not found: ${entryId}`);
    this.name = "CashEntryNotFoundError";
  }
}

export class PayableNotFoundError extends Error {
  constructor(payableId: string) {
    super(`Payable account not found: ${payableId}`);
    this.name = "PayableNotFoundError";
  }
}
