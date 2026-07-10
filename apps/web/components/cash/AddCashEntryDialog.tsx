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

import type { CashEntryInput } from "@/hooks/use-cash";
import {
  CASH_ENTRY_CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type CashEntryType,
} from "@/lib/mocks/cash.mock";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";

const DESCRIPTION_REQUIRED_MESSAGE = "La descripción es obligatoria.";
const DESTINATION_REQUIRED_MESSAGE = "Ingresa el destino de la cuenta.";
const AMOUNT_POSITIVE_MESSAGE = "El monto debe ser mayor a cero.";

const ENTRY_TYPE_LABELS: Record<CashEntryType, string> = {
  income: "Ingreso",
  expense: "Gasto",
};

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];
const DEFAULT_TYPE: CashEntryType = "income";
const DEFAULT_METHOD: PaymentMethod = "cash";
const DEFAULT_INCOME_CATEGORY = INCOME_CATEGORIES[0] ?? "sale";
const DEFAULT_EXPENSE_CATEGORY = EXPENSE_CATEGORIES[0] ?? "purchase";

const cashEntrySchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.enum([
    "sale",
    "collection",
    "other_income",
    "purchase",
    "technician_payment",
    "operating_expense",
    "partner_distribution",
    "other_expense",
  ]),
  description: z.string().min(1, DESCRIPTION_REQUIRED_MESSAGE),
  method: z.enum(["cash", "qr", "bank_transfer", "check", "credit_card"]),
  accountDestination: z.string().min(1, DESTINATION_REQUIRED_MESSAGE),
  amountBOB: z.coerce.number().positive(AMOUNT_POSITIVE_MESSAGE),
});

type CashEntryFormInput = z.input<typeof cashEntrySchema>;
type CashEntryFormValues = z.infer<typeof cashEntrySchema>;

const EMPTY_VALUES: CashEntryFormInput = {
  type: DEFAULT_TYPE,
  category: DEFAULT_INCOME_CATEGORY,
  description: "",
  method: DEFAULT_METHOD,
  accountDestination: "",
  amountBOB: 0,
};

interface AddCashEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CashEntryInput) => void;
}

export function AddCashEntryDialog({ open, onOpenChange, onCreate }: AddCashEntryDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CashEntryFormInput, unknown, CashEntryFormValues>({
    resolver: zodResolver(cashEntrySchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES);
    }
  }, [open, reset]);

  const type = watch("type");
  const category = watch("category");
  const method = watch("method");
  const visibleCategories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (nextType: CashEntryType) => {
    setValue("type", nextType);
    setValue("category", nextType === "income" ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY);
  };

  const onSubmit = (values: CashEntryFormValues) => {
    onCreate(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo movimiento de caja</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cash-entry-type">Tipo</Label>
              <Select
                modal={false}
                value={type}
                onValueChange={(value) => handleTypeChange((value ?? DEFAULT_TYPE) as CashEntryType)}
              >
                <SelectTrigger id="cash-entry-type">
                  <SelectValue>{() => ENTRY_TYPE_LABELS[type]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{ENTRY_TYPE_LABELS.income}</SelectItem>
                  <SelectItem value="expense">{ENTRY_TYPE_LABELS.expense}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cash-entry-category">Categoría</Label>
              <Select
                modal={false}
                value={category}
                onValueChange={(value) =>
                  setValue("category", (value ?? visibleCategories[0]) as CashEntryFormValues["category"])
                }
              >
                <SelectTrigger id="cash-entry-category">
                  <SelectValue>{() => CASH_ENTRY_CATEGORY_LABELS[category]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {visibleCategories.map((categoryOption) => (
                    <SelectItem key={categoryOption} value={categoryOption}>
                      {CASH_ENTRY_CATEGORY_LABELS[categoryOption]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cash-entry-description">Descripción</Label>
            <Input id="cash-entry-description" {...register("description")} />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cash-entry-method">Método de pago</Label>
              <Select
                modal={false}
                value={method}
                onValueChange={(value) => setValue("method", (value ?? DEFAULT_METHOD) as PaymentMethod)}
              >
                <SelectTrigger id="cash-entry-method">
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
              <Label htmlFor="cash-entry-destination">Destino de la cuenta</Label>
              <Input
                id="cash-entry-destination"
                placeholder="Ej: Efectivo caja"
                {...register("accountDestination")}
              />
              {errors.accountDestination ? (
                <p className="text-sm text-destructive">{errors.accountDestination.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cash-entry-amount">Monto (Bs.)</Label>
            <Input id="cash-entry-amount" type="number" step="0.01" {...register("amountBOB")} />
            {errors.amountBOB ? (
              <p className="text-sm text-destructive">{errors.amountBOB.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Registrar movimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
