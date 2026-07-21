"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useAtom } from "jotai";

import { cashContextAtom } from "@/lib/atoms/cash-context.atom";
import { CASH_CONTEXT_LABELS, CASH_CONTEXTS, type CashContext } from "@/lib/cash-types";

const DEFAULT_CASH_CONTEXT: CashContext = "sigas";

export function CashContextSelector() {
  const [cashContext, setCashContext] = useAtom(cashContextAtom);

  return (
    <Tabs
      value={cashContext}
      onValueChange={(value) => setCashContext((value ?? DEFAULT_CASH_CONTEXT) as CashContext)}
    >
      <TabsList>
        {CASH_CONTEXTS.map((context) => (
          <TabsTrigger key={context} value={context}>
            {CASH_CONTEXT_LABELS[context]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
