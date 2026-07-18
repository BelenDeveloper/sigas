"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PaymentInput, PaymentInstallment } from "@/hooks/use-projects";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";

const AMOUNT_POSITIVE_MESSAGE = "El monto debe ser mayor a cero.";
const DATE_REQUIRED_MESSAGE = "La fecha es obligatoria.";
const DESTINATION_REQUIRED_MESSAGE = "Indica a dónde fue el dinero (cuenta destino).";
const SAVE_ERROR_MESSAGE = "No se pudo registrar el pago. Intenta nuevamente.";

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];
const DEFAULT_METHOD: PaymentMethod = "bank_transfer";

const paymentSchema = z.object({
  amountBOB: z.coerce.number().positive(AMOUNT_POSITIVE_MESSAGE),
  method: z.enum(["cash", "qr", "bank_transfer", "check", "credit_card"]),
  accountDestination: z.string().min(1, DESTINATION_REQUIRED_MESSAGE),
  date: z.string().min(1, DATE_REQUIRED_MESSAGE),
});

type PaymentFormInput = z.input<typeof paymentSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildEmptyValues(): PaymentFormInput {
  return { amountBOB: 0, method: DEFAULT_METHOD, accountDestination: "", date: todayISODate() };
}

interface RecordPaymentDialogProps {
  installment: PaymentInstallment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRecordingPayment: boolean;
  onConfirm: (installment: PaymentInstallment, payment: PaymentInput) => Promise<void>;
}

export function RecordPaymentDialog({
  installment,
  open,
  onOpenChange,
  isRecordingPayment,
  onConfirm,
}: RecordPaymentDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(null);
    }
  }, [open, installment, reset]);

  const method = watch("method");

  if (!installment) {
    return null;
  }

  const installmentLabel = installment === "first" ? "Cuota 1" : "Cuota 2";

  const onSubmit = async (values: PaymentFormValues) => {
    setErrorMessage(null);

    try {
      await onConfirm(installment, values);
      onOpenChange(false);
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pago — {installmentLabel}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="record-payment-amount">Monto (Bs.)</Label>
            <Input id="record-payment-amount" type="number" step="0.01" {...register("amountBOB")} />
            {errors.amountBOB ? (
              <p className="text-sm text-destructive">{errors.amountBOB.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="record-payment-method">Método de pago</Label>
            <Select
              modal={false}
              value={method}
              onValueChange={(value) => setValue("method", (value ?? DEFAULT_METHOD) as PaymentMethod)}
            >
              <SelectTrigger id="record-payment-method">
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
            <Label htmlFor="record-payment-destination">Cuenta destino</Label>
            <Input id="record-payment-destination" {...register("accountDestination")} />
            {errors.accountDestination ? (
              <p className="text-sm text-destructive">{errors.accountDestination.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="record-payment-date">Fecha</Label>
            <Input id="record-payment-date" type="date" {...register("date")} />
            {errors.date ? <p className="text-sm text-destructive">{errors.date.message}</p> : null}
          </div>

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isRecordingPayment}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isRecordingPayment ? <Loader2 className="size-4 animate-spin" /> : "Confirmar pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
