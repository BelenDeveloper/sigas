import type { Sale } from "@/lib/mocks/sales.mock";

export function getSaleTotalBOB(sale: Pick<Sale, "items">): number {
  return sale.items.reduce((sum, item) => sum + item.quantity * item.unitPriceBOB, 0);
}

export function getSalePaidBOB(sale: Pick<Sale, "payments">): number {
  return sale.payments.reduce((sum, payment) => sum + payment.amountBOB, 0);
}

export function getSalePendingBOB(sale: Pick<Sale, "items" | "payments">): number {
  return getSaleTotalBOB(sale) - getSalePaidBOB(sale);
}
