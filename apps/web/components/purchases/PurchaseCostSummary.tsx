import { formatCurrencyBOB } from "@/lib/format-currency";

const PRODUCTS_SUBTOTAL_LABEL = "Subtotal de productos";
const EMPTY_LABEL_FALLBACK = "—";
const TOTAL_LABEL = "COSTO TOTAL DEL PEDIDO";

interface PurchaseCostSummaryItem {
  label: string;
  amountBOB: number;
}

interface PurchaseCostSummaryProps {
  productsSubtotalBOB: number;
  costItems: PurchaseCostSummaryItem[];
}

export function PurchaseCostSummary({ productsSubtotalBOB, costItems }: PurchaseCostSummaryProps) {
  const costItemsTotalBOB = costItems.reduce((sum, costItem) => sum + costItem.amountBOB, 0);
  const totalBOB = productsSubtotalBOB + costItemsTotalBOB;

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{PRODUCTS_SUBTOTAL_LABEL}</span>
        <span className="text-foreground">{formatCurrencyBOB(productsSubtotalBOB)}</span>
      </div>

      {costItems.map((costItem, index) => (
        <div key={index} className="flex justify-between">
          <span className="text-muted-foreground">{costItem.label || EMPTY_LABEL_FALLBACK}</span>
          <span className="text-foreground">{formatCurrencyBOB(costItem.amountBOB)}</span>
        </div>
      ))}

      <div className="mt-1 flex justify-between border-t border-border pt-2 font-semibold text-foreground">
        <span>{TOTAL_LABEL}</span>
        <span>{formatCurrencyBOB(totalBOB)}</span>
      </div>
    </div>
  );
}
