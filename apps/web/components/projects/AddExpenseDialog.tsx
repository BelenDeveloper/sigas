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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ExpenseInput } from "@/hooks/use-projects";
import { getStageByKey, PROJECT_STAGES, type ProjectStageKey } from "@/lib/constants/project-stages";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";
import { uploadProjectFile, type GetProjectUploadUrl } from "@/lib/project-file-upload";

const DESCRIPTION_REQUIRED_MESSAGE = "La descripción es obligatoria.";
const AMOUNT_POSITIVE_MESSAGE = "El monto debe ser mayor a cero.";
const SAVE_ERROR_MESSAGE = "No se pudo guardar el gasto. Intenta nuevamente.";

const PROJECT_STAGE_KEYS = PROJECT_STAGES.map((stage) => stage.key) as [
  ProjectStageKey,
  ...ProjectStageKey[],
];

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];
const DEFAULT_METHOD: PaymentMethod = "cash";

const expenseSchema = z.object({
  stage: z.enum(PROJECT_STAGE_KEYS),
  description: z.string().min(1, DESCRIPTION_REQUIRED_MESSAGE),
  amountBOB: z.coerce.number().positive(AMOUNT_POSITIVE_MESSAGE),
  method: z.enum(["cash", "qr", "bank_transfer", "check", "credit_card"]),
});

type ExpenseFormInput = z.input<typeof expenseSchema>;
type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStage: ProjectStageKey;
  getUploadUrl: GetProjectUploadUrl;
  isAddingExpense: boolean;
  onCreate: (input: ExpenseInput) => Promise<void>;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  currentStage,
  getUploadUrl,
  isAddingExpense,
  onCreate,
}: AddExpenseDialogProps) {
  const emptyValues: ExpenseFormInput = {
    stage: currentStage,
    description: "",
    amountBOB: 0,
    method: DEFAULT_METHOD,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: emptyValues,
  });

  const [selectedReceipt, setSelectedReceipt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      reset(emptyValues);
      setSelectedReceipt(null);
      setUploadError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentStage, reset]);

  const stage = watch("stage");
  const method = watch("method");

  const isSaving = isUploading || isAddingExpense;

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedReceipt(event.target.files?.[0] ?? null);
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const receiptUrl = selectedReceipt
        ? await uploadProjectFile(selectedReceipt, getUploadUrl)
        : undefined;

      await onCreate({ ...values, receiptUrl });
      onOpenChange(false);
    } catch {
      setUploadError(SAVE_ERROR_MESSAGE);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-form-stage">Etapa</Label>
            <Select
              modal={false}
              value={stage}
              onValueChange={(value) => setValue("stage", (value ?? currentStage) as ProjectStageKey)}
            >
              <SelectTrigger id="expense-form-stage">
                <SelectValue>{() => getStageByKey(stage).label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STAGES.map((stageOption) => (
                  <SelectItem key={stageOption.key} value={stageOption.key}>
                    {stageOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-form-description">Descripción</Label>
            <Input id="expense-form-description" {...register("description")} />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-form-amount">Monto (Bs.)</Label>
              <Input id="expense-form-amount" type="number" step="0.01" {...register("amountBOB")} />
              {errors.amountBOB ? (
                <p className="text-sm text-destructive">{errors.amountBOB.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-form-method">Método de pago</Label>
              <Select
                modal={false}
                value={method}
                onValueChange={(value) => setValue("method", (value ?? DEFAULT_METHOD) as PaymentMethod)}
              >
                <SelectTrigger id="expense-form-method">
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
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-form-receipt">Comprobante (opcional)</Label>
            <Input
              id="expense-form-receipt"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleReceiptChange}
            />
          </div>

          {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={isSaving} className="bg-brand text-brand-foreground hover:bg-brand/90">
              {isSaving ? "Subiendo..." : "Agregar gasto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
