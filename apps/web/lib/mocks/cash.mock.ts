import type { PaymentMethod } from "@/lib/payment-method";

export type CashEntryType = "income" | "expense";

export type IncomeCategory = "sale" | "collection" | "other_income";
export type ExpenseCategory =
  | "purchase"
  | "technician_payment"
  | "operating_expense"
  | "partner_distribution"
  | "other_expense";
export type CashEntryCategory = IncomeCategory | ExpenseCategory;

export const INCOME_CATEGORIES: IncomeCategory[] = ["sale", "collection", "other_income"];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "purchase",
  "technician_payment",
  "operating_expense",
  "partner_distribution",
  "other_expense",
];

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

export interface CashEntry {
  id: string;
  type: CashEntryType;
  category: CashEntryCategory;
  description: string;
  method: PaymentMethod;
  accountDestination: string;
  amountBOB: number;
  createdAt: string;
  isCancelled: boolean;
}

export interface CashSession {
  id: string;
  isOpen: boolean;
  openedAt: string;
  closedAt: string | null;
  closingAmountBOB: number | null;
}

export type CreditorType = "supplier" | "investor" | "company_loan" | "other";

export const CREDITOR_TYPES: CreditorType[] = ["supplier", "investor", "company_loan", "other"];

export const CREDITOR_TYPE_LABELS: Record<CreditorType, string> = {
  supplier: "Proveedor",
  investor: "Inversionista",
  company_loan: "Préstamo empresarial",
  other: "Otro",
};

export interface PayablePayment {
  id: string;
  date: string;
  amountBOB: number;
  method: PaymentMethod;
  destination: string;
}

export interface Payable {
  id: string;
  creditorType: CreditorType;
  creditorName: string;
  supplierId: string | null;
  amountBOB: number;
  dueDate: string;
  category: string;
  invoiceNumber: string;
  notes: string;
  payments: PayablePayment[];
}

export const MOCK_CASH_SESSION: CashSession = {
  id: "session-1",
  isOpen: true,
  openedAt: "2026-07-10T08:00:00",
  closedAt: null,
  closingAmountBOB: null,
};

export const MOCK_CASH_ENTRIES: CashEntry[] = [
  {
    id: "1",
    type: "income",
    category: "sale",
    description: "Venta de garrafas - cliente mostrador",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 850,
    createdAt: "2026-07-10T08:15:00",
    isCancelled: false,
  },
  {
    id: "2",
    type: "income",
    category: "sale",
    description: "Venta VTA-0032",
    method: "qr",
    accountDestination: "QR Banco Unión",
    amountBOB: 3200,
    createdAt: "2026-07-10T08:40:00",
    isCancelled: false,
  },
  {
    id: "3",
    type: "income",
    category: "collection",
    description: "Cobro de saldo pendiente - Hotel Real Cochabamba",
    method: "bank_transfer",
    accountDestination: "Cuenta BNB",
    amountBOB: 8200,
    createdAt: "2026-07-10T09:05:00",
    isCancelled: false,
  },
  {
    id: "4",
    type: "expense",
    category: "purchase",
    description: "Compra COM-0007 - Ferretería Central",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 1460,
    createdAt: "2026-07-10T09:30:00",
    isCancelled: false,
  },
  {
    id: "5",
    type: "expense",
    category: "technician_payment",
    description: "Pago a técnico - instalación Urb. Las Palmas",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 450,
    createdAt: "2026-07-10T09:45:00",
    isCancelled: false,
  },
  {
    id: "6",
    type: "income",
    category: "sale",
    description: "Venta de reguladores - cliente mostrador",
    method: "qr",
    accountDestination: "QR Banco Unión",
    amountBOB: 1900,
    createdAt: "2026-07-10T10:00:00",
    isCancelled: false,
  },
  {
    id: "7",
    type: "expense",
    category: "operating_expense",
    description: "Pago de internet y telefonía de oficina",
    method: "bank_transfer",
    accountDestination: "Cuenta BNB",
    amountBOB: 320,
    createdAt: "2026-07-10T10:20:00",
    isCancelled: false,
  },
  {
    id: "8",
    type: "income",
    category: "other_income",
    description: "Alquiler de andamios a terceros",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 200,
    createdAt: "2026-07-10T10:35:00",
    isCancelled: false,
  },
  {
    id: "9",
    type: "expense",
    category: "partner_distribution",
    description: "Distribución a socio: Cristian Zaballa",
    method: "bank_transfer",
    accountDestination: "Cuenta BNB",
    amountBOB: 2500,
    createdAt: "2026-07-10T10:50:00",
    isCancelled: false,
  },
  {
    id: "10",
    type: "income",
    category: "sale",
    description: "Venta VTA-0035",
    method: "qr",
    accountDestination: "QR personal Cristian",
    amountBOB: 1200,
    createdAt: "2026-07-10T11:10:00",
    isCancelled: false,
  },
  {
    id: "11",
    type: "expense",
    category: "other_expense",
    description: "Compra de material de oficina",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 95,
    createdAt: "2026-07-10T11:25:00",
    isCancelled: false,
  },
  {
    id: "12",
    type: "income",
    category: "collection",
    description: "Cobro de saldo pendiente - Constructora Andina",
    method: "bank_transfer",
    accountDestination: "Cuenta BNB",
    amountBOB: 4500,
    createdAt: "2026-07-10T11:40:00",
    isCancelled: false,
  },
  {
    id: "13",
    type: "expense",
    category: "purchase",
    description: "Compra COM-0011 - Ferretería Central",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 85,
    createdAt: "2026-07-10T11:55:00",
    isCancelled: false,
  },
  {
    id: "14",
    type: "income",
    category: "sale",
    description: "Venta de manguera de gas - cliente mostrador",
    method: "qr",
    accountDestination: "QR Banco Unión",
    amountBOB: 650,
    createdAt: "2026-07-10T12:10:00",
    isCancelled: false,
  },
  {
    id: "15",
    type: "expense",
    category: "technician_payment",
    description: "Pago a técnico - mantenimiento Hotel Real",
    method: "qr",
    accountDestination: "QR personal Cristian",
    amountBOB: 380,
    createdAt: "2026-07-10T12:25:00",
    isCancelled: false,
  },
  {
    id: "16",
    type: "income",
    category: "sale",
    description: "Venta de detector de fugas - cliente mostrador",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 180,
    createdAt: "2026-07-10T12:40:00",
    isCancelled: true,
  },
  {
    id: "17",
    type: "expense",
    category: "operating_expense",
    description: "Combustible para vehículo de reparto",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 250,
    createdAt: "2026-07-10T12:55:00",
    isCancelled: false,
  },
  {
    id: "18",
    type: "income",
    category: "other_income",
    description: "Venta de chatarra de tuberías",
    method: "cash",
    accountDestination: "Efectivo caja",
    amountBOB: 60,
    createdAt: "2026-07-10T13:10:00",
    isCancelled: false,
  },
  {
    id: "19",
    type: "expense",
    category: "other_expense",
    description: "Pago anulado por error de digitación",
    method: "bank_transfer",
    accountDestination: "Cuenta BNB",
    amountBOB: 1000,
    createdAt: "2026-07-10T13:25:00",
    isCancelled: true,
  },
  {
    id: "20",
    type: "income",
    category: "sale",
    description: "Venta de válvulas de seguridad - cliente mostrador",
    method: "qr",
    accountDestination: "QR Banco Unión",
    amountBOB: 470,
    createdAt: "2026-07-10T13:40:00",
    isCancelled: false,
  },
];

export const MOCK_PAYABLES: Payable[] = [
  {
    id: "1",
    creditorType: "supplier",
    creditorName: "Ferretería Central S.R.L.",
    supplierId: "1",
    amountBOB: 1460,
    dueDate: "2026-07-25",
    category: "Reposición de inventario",
    invoiceNumber: "F-4589",
    notes: "",
    payments: [],
  },
  {
    id: "2",
    creditorType: "investor",
    creditorName: "Rodrigo Salinas Ortiz",
    supplierId: null,
    amountBOB: 15000,
    dueDate: "2026-08-15",
    category: "Retorno de inversión",
    invoiceNumber: "",
    notes: "Pago trimestral acordado.",
    payments: [
      { id: "pp1", date: "2026-07-05", amountBOB: 5000, method: "bank_transfer", destination: "Cuenta BNB" },
    ],
  },
  {
    id: "3",
    creditorType: "company_loan",
    creditorName: "Banco Unión - Préstamo vehicular",
    supplierId: null,
    amountBOB: 6200,
    dueDate: "2026-06-30",
    category: "Cuota de préstamo",
    invoiceNumber: "",
    notes: "Cuota mensual del préstamo para camioneta de reparto.",
    payments: [],
  },
  {
    id: "4",
    creditorType: "supplier",
    creditorName: "Importadora Boliviana de Gas S.A.",
    supplierId: "2",
    amountBOB: 1900,
    dueDate: "2026-07-20",
    category: "Reposición de inventario",
    invoiceNumber: "F-1187",
    notes: "",
    payments: [
      { id: "pp2", date: "2026-07-06", amountBOB: 1900, method: "bank_transfer", destination: "Cuenta BNB" },
    ],
  },
  {
    id: "5",
    creditorType: "other",
    creditorName: "Alcaldía de La Paz - Patente municipal",
    supplierId: null,
    amountBOB: 850,
    dueDate: "2026-07-31",
    category: "Impuestos y tasas",
    invoiceNumber: "",
    notes: "",
    payments: [
      { id: "pp3", date: "2026-07-08", amountBOB: 300, method: "cash", destination: "Efectivo caja" },
    ],
  },
];
