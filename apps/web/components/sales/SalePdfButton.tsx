"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Share2 } from "lucide-react";

const SHARE_STUB_MESSAGE = "share stub";

interface SalePdfButtonProps {
  saleId: string;
}

export function SalePdfButton({ saleId }: SalePdfButtonProps) {
  const handleShare = () => {
    console.log(SHARE_STUB_MESSAGE, saleId);
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      <Share2 className="size-4" />
      Compartir por WhatsApp
    </Button>
  );
}
