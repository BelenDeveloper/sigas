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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PartnerDistributionInput } from "@/hooks/use-cash";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";

const PARTNER_NAME_REQUIRED_MESSAGE = "El nombre del socio es obligatorio.";
const DESTINATION_REQUIRED_MESSAGE = "Ingresa el destino de la cuenta.";
const AMOUNT_POSITIVE_MESSAGE = "El monto debe ser mayor a cero.";

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
  onCreate: (input: PartnerDistributionInput) => void;
}

export function PartnerDistributionDialog({
  open,
  onOpenChange,
  onCreate,
}: PartnerDistributionDialogProps) {
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
    }
  }, [open, reset]);

  const method = watch("method");

  const onSubmit = (values: PartnerDistributionFormValues) => {
    onCreate(values);
    onOpenChange(false);
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

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Registrar distribución
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
