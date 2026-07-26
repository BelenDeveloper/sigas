"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Plus, X } from "lucide-react";

import type { PurchaseCostItemInput } from "@/hooks/use-purchases";

const COST_LABEL_SUGGESTIONS = ["Transporte", "Aduana", "Logística", "Seguro", "Otro"];
const COST_LABEL_SUGGESTIONS_LIST_ID = "purchase-cost-item-label-suggestions";
const NO_COST_ITEMS_MESSAGE = "Todavía no agregaste costos adicionales.";
const LABEL_PLACEHOLDER = "Ej: Transporte";
const EMPTY_COST_ITEM: PurchaseCostItemInput = { label: "", amountBOB: 0 };

interface PurchaseCostItemsEditorProps {
  costItems: PurchaseCostItemInput[];
  onCostItemsChange: (costItems: PurchaseCostItemInput[]) => void;
}

export function PurchaseCostItemsEditor({
  costItems,
  onCostItemsChange,
}: PurchaseCostItemsEditorProps) {
  const handleAddCostItem = () => {
    onCostItemsChange([...costItems, { ...EMPTY_COST_ITEM }]);
  };

  const handleRemoveCostItem = (index: number) => {
    onCostItemsChange(costItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleLabelChange = (index: number, label: string) => {
    onCostItemsChange(
      costItems.map((costItem, itemIndex) =>
        itemIndex === index ? { ...costItem, label } : costItem,
      ),
    );
  };

  const handleAmountChange = (index: number, amountBOB: number) => {
    onCostItemsChange(
      costItems.map((costItem, itemIndex) =>
        itemIndex === index ? { ...costItem, amountBOB } : costItem,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <datalist id={COST_LABEL_SUGGESTIONS_LIST_ID}>
        {COST_LABEL_SUGGESTIONS.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>

      {costItems.length > 0 ? (
        <div className="flex flex-col gap-2">
          {costItems.map((costItem, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                list={COST_LABEL_SUGGESTIONS_LIST_ID}
                placeholder={LABEL_PLACEHOLDER}
                className="flex-1"
                value={costItem.label}
                onChange={(event) => handleLabelChange(index, event.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                className="w-32"
                value={costItem.amountBOB}
                onChange={(event) => handleAmountChange(index, Number(event.target.value))}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Quitar costo"
                onClick={() => handleRemoveCostItem(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{NO_COST_ITEMS_MESSAGE}</p>
      )}

      <Button variant="outline" onClick={handleAddCostItem} className="w-fit">
        <Plus className="size-4" />
        Agregar costo
      </Button>
    </div>
  );
}
