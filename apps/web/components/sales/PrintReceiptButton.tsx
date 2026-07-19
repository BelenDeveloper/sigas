"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Printer } from "lucide-react";

interface PrintReceiptButtonProps {
  saleId: string;
}

export function PrintReceiptButton({ saleId }: PrintReceiptButtonProps) {
  const handlePrint = () => {
    window.open(`/sales/${saleId}/receipt`, "_blank");
  };

  return (
    <Button variant="outline" onClick={handlePrint}>
      <Printer className="size-4" />
      Imprimir recibo
    </Button>
  );
}
