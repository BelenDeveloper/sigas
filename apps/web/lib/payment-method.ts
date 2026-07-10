export type PaymentMethod = "cash" | "qr" | "bank_transfer" | "check" | "credit_card";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  qr: "QR",
  bank_transfer: "Transferencia bancaria",
  check: "Cheque",
  credit_card: "Tarjeta de crédito",
};
