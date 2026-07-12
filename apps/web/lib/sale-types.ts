export const SALE_TYPES = ["quotation", "order", "sale", "return"] as const;
export type SaleType = (typeof SALE_TYPES)[number];

export const SALE_TYPE_LABELS: Record<SaleType, string> = {
  quotation: "Cotización",
  order: "Pedido",
  sale: "Venta",
  return: "Devolución",
};

export const SALE_STATUSES = ["draft", "confirmed", "partial", "paid", "cancelled"] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  draft: "Borrador",
  confirmed: "Confirmada",
  partial: "Parcial",
  paid: "Pagada",
  cancelled: "Cancelada",
};
