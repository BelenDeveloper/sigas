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

import type { PartnerDistributionInput } from "@/hooks/use-cash";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";

const PARTNER_NAME_REQUIRED_MESSAGE = "El nombre del socio es obligatorio.";
const DESTINATION_REQUIRED_MESSAGE = "Ingresa el destino de la cuenta.";
const AMOUNT_POSITIVE_MESSAGE = "El monto debe ser mayor a cero.";
const SAVE_ERROR_MESSAGE = "No se pudo registrar la distribución. Intenta nuevamente.";

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];
const DEFAULT_METHOD: PaymentMethod = "cash";

const partnerDistributionSchema = z.object({
  partnerName: z.string().min(1, PARTNER_NAME_REQUIRED_MESSAGE),
  amountBOB: z.coerce.number().positive(AMOUNT_POSITIVE_MESSAGE),
  method: z.enum(["cash", "qr", "bank_transfer", "check", "credit_card"]),
  accountDestination: z.string().min(1, DESTINATION_REQUIRED_MESSAGE),
});

type PartnerDistributionFormInput = z.input<typeof partnerDistributionSchema>;
type PartnerDistributionFormValues = z.infer<typeof partnerDistributionSchema>;

const EMPTY_VALUES: PartnerDistributionFormInput = {
  partnerName: "",
  amountBOB: 0,
  method: DEFAULT_METHOD,
  accountDestination: "",
};

interface PartnerDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCreating: boolean;
  onCreate: (input: PartnerDistributionInput) => Promise<void>;
}

export function PartnerDistributionDialog({
  open,
  onOpenChange,
  isCreating,
  onCreate,
}: PartnerDistributionDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PartnerDistributionFormInput, unknown, PartnerDistributionFormValues>({
    resolver: zodResolver(partnerDistributionSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES);
      setErrorMessage(null);
    }
  }, [open, reset]);

  const method = watch("method");

  const onSubmit = async (values: PartnerDistributionFormValues) => {
    setErrorMessage(null);

    try {
      await onCreate(values);
      onOpenChange(false);
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Distribución a socio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="partner-distribution-name">Nombre del socio</Label>
            <Input id="partner-distribution-name" {...register("partnerName")} />
            {errors.partnerName ? (
              <p className="text-sm text-destructive">{errors.partnerName.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="partner-distribution-amount">Monto (Bs.)</Label>
            <Input
              id="partner-distribution-amount"
              type="number"
              step="0.01"
              {...register("amountBOB")}
            />
            {errors.amountBOB ? (
              <p className="text-sm text-destructive">{errors.amountBOB.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="partner-distribution-method">Método de pago</Label>
            <Select
              modal={false}
              value={method}
              onValueChange={(value) => setValue("method", (value ?? DEFAULT_METHOD) as PaymentMethod)}
            >
              <SelectTrigger id="partner-distribution-method">
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
            <Label htmlFor="partner-distribution-destination">Destino de la cuenta</Label>
            <Input id="partner-distribution-destination" {...register("accountDestination")} />
            {errors.accountDestination ? (
              <p className="text-sm text-destructive">{errors.accountDestination.message}</p>
            ) : null}
          </div>

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isCreating ? <Loader2 className="size-4 animate-spin" /> : "Registrar distribución"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
