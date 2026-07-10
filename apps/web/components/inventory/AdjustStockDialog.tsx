"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { Product } from "@/lib/mocks/inventory.mock";

const QUANTITY_ZERO_MESSAGE = "La cantidad no puede ser cero.";
const REASON_REQUIRED_MESSAGE = "El motivo es obligatorio.";

const adjustStockSchema = z.object({
  quantity: z.coerce.number().refine((value) => value !== 0, QUANTITY_ZERO_MESSAGE),
  reason: z.string().min(1, REASON_REQUIRED_MESSAGE),
});

type AdjustStockFormInput = z.input<typeof adjustStockSchema>;
type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

const DEFAULT_VALUES: AdjustStockFormInput = { quantity: 0, reason: "" };

interface AdjustStockDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (productId: string, quantityDelta: number, reason: string) => void;
}

export function AdjustStockDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: AdjustStockDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AdjustStockFormInput, unknown, AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const quantity = useWatch({ control, name: "quantity" });

  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES);
    }
  }, [open, product, reset]);

  if (!product) {
    return null;
  }

  const newStockLevel = product.currentStock + (Number(quantity) || 0);

  const onSubmit = (values: AdjustStockFormValues) => {
    onConfirm(product.id, values.quantity, values.reason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar stock</DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="adjust-quantity">Cantidad (positivo = entrada, negativo = salida)</Label>
            <Input id="adjust-quantity" type="number" {...register("quantity")} />
            {errors.quantity ? (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="adjust-reason">Motivo</Label>
            <Input id="adjust-reason" placeholder="Ej: compra a proveedor" {...register("reason")} />
            {errors.reason ? (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">
            Stock actual: {product.currentStock} → Nuevo stock:{" "}
            <span className="font-medium text-foreground">{newStockLevel}</span>
          </p>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Confirmar ajuste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
