export const CASH_ENTRY_TYPES = ["income", "expense"] as const;
export type CashEntryType = (typeof CASH_ENTRY_TYPES)[number];

export const INCOME_CATEGORIES = ["sale", "collection", "other_income"] as const;
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export const EXPENSE_CATEGORIES = [
  "purchase",
  "technician_payment",
  "operating_expense",
  "partner_distribution",
  "other_expense",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type CashEntryCategory = IncomeCategory | ExpenseCategory;

export const CASH_ENTRY_CATEGORY_LABELS: Record<CashEntryCategory, string> = {
  sale: "Venta",
  collection: "Cobro",
  other_income: "Otro ingreso",
  purchase: "Compra",
  technician_payment: "Pago a técnico",
  operating_expense: "Gasto operativo",
  partner_distribution: "Distribución a socio",
  other_expense: "Otro gasto",
};

export const CREDITOR_TYPES = ["supplier", "investor", "company_loan", "other"] as const;
export type CreditorType = (typeof CREDITOR_TYPES)[number];

export const CREDITOR_TYPE_LABELS: Record<CreditorType, string> = {
  supplier: "Proveedor",
  investor: "Inversionista",
  company_loan: "Préstamo empresarial",
  other: "Otro",
};

export const PAYABLE_STATUSES = ["pending", "partial", "paid", "overdue"] as const;
export type PayableStatus = (typeof PAYABLE_STATUSES)[number];

export const PAYABLE_STATUS_LABELS: Record<PayableStatus, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  overdue: "Vencido",
};
