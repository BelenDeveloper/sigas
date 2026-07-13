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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PayablePaymentInput, PayableView } from "@/hooks/use-cash";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";

const DESTINATION_REQUIRED_MESSAGE = "Ingresa el destino del pago.";
const DATE_REQUIRED_MESSAGE = "La fecha es obligatoria.";
const AMOUNT_POSITIVE_MESSAGE = "El monto debe ser mayor a cero.";

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];
const DEFAULT_METHOD: PaymentMethod = "cash";

const paymentSchema = z.object({
  amountBOB: z.coerce.number().positive(AMOUNT_POSITIVE_MESSAGE),
  method: z.enum(["cash", "qr", "bank_transfer", "check", "credit_card"]),
  destination: z.string().min(1, DESTINATION_REQUIRED_MESSAGE),
  date: z.string().min(1, DATE_REQUIRED_MESSAGE),
});

type PaymentFormInput = z.input<typeof paymentSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildEmptyValues(): PaymentFormInput {
  return {
    amountBOB: 0,
    method: DEFAULT_METHOD,
    destination: "",
    date: todayISODate(),
  };
}

interface AddPaymentDialogProps {
  payable: PayableView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payableId: string, payment: PayablePaymentInput) => void;
}

export function AddPaymentDialog({ payable, open, onOpenChange, onConfirm }: AddPaymentDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: buildEmptyValues(),
  });

  useEffect(() => {
    if (open) {
      reset(buildEmptyValues());
    }
  }, [open, payable, reset]);

  const method = watch("method");

  if (!payable) {
    return null;
  }

  const onSubmit = (values: PaymentFormValues) => {
    onConfirm(payable.id, values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar pago</DialogTitle>
          <DialogDescription>{payable.creditorName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="payable-payment-amount">Monto (Bs.)</Label>
            <Input id="payable-payment-amount" type="number" step="0.01" {...register("amountBOB")} />
            {errors.amountBOB ? (
              <p className="text-sm text-destructive">{errors.amountBOB.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payable-payment-method">Método de pago</Label>
            <Select
              modal={false}
              value={method}
              onValueChange={(value) => setValue("method", (value ?? DEFAULT_METHOD) as PaymentMethod)}
            >
              <SelectTrigger id="payable-payment-method">
                <SelectValue>{() => PAYMENT_METHOD_LABELS[method]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((paymentMethod) => (
                  <SelectItem key={paymentMethod} value={paymentMethod}>
                    {PAYMENT_METHOD_LABELS[paymentMethod]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payable-payment-destination">Destino</Label>
            <Input id="payable-payment-destination" {...register("destination")} />
            {errors.destination ? (
              <p className="text-sm text-destructive">{errors.destination.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payable-payment-date">Fecha</Label>
            <Input id="payable-payment-date" type="date" {...register("date")} />
            {errors.date ? <p className="text-sm text-destructive">{errors.date.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Confirmar pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
