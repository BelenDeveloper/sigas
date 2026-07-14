import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

import { ListSkeleton } from "@/components/shared/ListSkeleton";
import type { LowStockProduct } from "@/lib/mocks/dashboard.mock";

const CRITICAL_STOCK_LABEL = "Crítico";
const SKELETON_ITEMS = 4;

interface LowStockListProps {
  products: LowStockProduct[];
  isLoading: boolean;
}

export function LowStockList({ products, isLoading }: LowStockListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock bajo el mínimo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          <ListSkeleton items={SKELETON_ITEMS} />
        ) : (
          products.map((product) => (
            <div key={product.id} className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{product.name}</span>
                <span className="text-xs text-muted-foreground">
                  Stock actual: {product.currentStock} · Mínimo: {product.minimumStock}
                </span>
              </div>
              <Badge variant="destructive">{CRITICAL_STOCK_LABEL}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
