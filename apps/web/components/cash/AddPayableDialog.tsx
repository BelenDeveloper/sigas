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
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PayableInput } from "@/hooks/use-cash";
import { CREDITOR_TYPES, CREDITOR_TYPE_LABELS, type CreditorType } from "@/lib/cash-types";
import type { Supplier } from "@/lib/supplier-types";

const SUPPLIER_REQUIRED_MESSAGE = "Selecciona un proveedor.";
const CREDITOR_NAME_REQUIRED_MESSAGE = "El nombre del acreedor es obligatorio.";
const DUE_DATE_REQUIRED_MESSAGE = "La fecha de vencimiento es obligatoria.";
const CATEGORY_REQUIRED_MESSAGE = "La categoría es obligatoria.";
const AMOUNT_POSITIVE_MESSAGE = "El monto debe ser mayor a cero.";
const SELECT_SUPPLIER_PLACEHOLDER = "Selecciona un proveedor";

const DEFAULT_CREDITOR_TYPE: CreditorType = "supplier";

const payableSchema = z
  .object({
    creditorType: z.enum(["supplier", "investor", "company_loan", "other"]),
    supplierId: z.string(),
    creditorName: z.string(),
    amountBOB: z.coerce.number().positive(AMOUNT_POSITIVE_MESSAGE),
    dueDate: z.string().min(1, DUE_DATE_REQUIRED_MESSAGE),
    category: z.string().min(1, CATEGORY_REQUIRED_MESSAGE),
    invoiceNumber: z.string(),
    notes: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.creditorType === "supplier" && !values.supplierId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: SUPPLIER_REQUIRED_MESSAGE,
        path: ["supplierId"],
      });
    }

    if (values.creditorType !== "supplier" && values.creditorName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: CREDITOR_NAME_REQUIRED_MESSAGE,
        path: ["creditorName"],
      });
    }
  });

type PayableFormInput = z.input<typeof payableSchema>;
type PayableFormValues = z.infer<typeof payableSchema>;

const EMPTY_VALUES: PayableFormInput = {
  creditorType: DEFAULT_CREDITOR_TYPE,
  supplierId: "",
  creditorName: "",
  amountBOB: 0,
  dueDate: "",
  category: "",
  invoiceNumber: "",
  notes: "",
};

interface AddPayableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  onCreate: (input: PayableInput) => void;
}

export function AddPayableDialog({ open, onOpenChange, suppliers, onCreate }: AddPayableDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PayableFormInput, unknown, PayableFormValues>({
    resolver: zodResolver(payableSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES);
    }
  }, [open, reset]);

  const creditorType = watch("creditorType");
  const supplierId = watch("supplierId");
  const isSupplierType = creditorType === "supplier";
  const selectedSupplier = suppliers.find((supplier) => supplier.id === supplierId);

  const onSubmit = (values: PayableFormValues) => {
    const isSupplier = values.creditorType === "supplier";
    const supplier = suppliers.find((candidate) => candidate.id === values.supplierId);

    onCreate({
      creditorType: values.creditorType,
      creditorName: isSupplier ? (supplier?.companyName ?? "") : values.creditorName,
      supplierId: isSupplier ? values.supplierId : null,
      amountBOB: values.amountBOB,
      dueDate: values.dueDate,
      category: values.category,
      invoiceNumber: values.invoiceNumber,
      notes: values.notes,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva cuenta por pagar</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="payable-creditor-type">Tipo de acreedor</Label>
            <Select
              modal={false}
              value={creditorType}
              onValueChange={(value) =>
                setValue("creditorType", (value ?? DEFAULT_CREDITOR_TYPE) as CreditorType)
              }
            >
              <SelectTrigger id="payable-creditor-type">
                <SelectValue>{() => CREDITOR_TYPE_LABELS[creditorType]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CREDITOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {CREDITOR_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSupplierType ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="payable-supplier">Proveedor</Label>
              <Select
                modal={false}
                value={supplierId}
                onValueChange={(value) => setValue("supplierId", value ?? "")}
              >
                <SelectTrigger id="payable-supplier">
                  <SelectValue>{() => selectedSupplier?.companyName ?? SELECT_SUPPLIER_PLACEHOLDER}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId ? (
                <p className="text-sm text-destructive">{errors.supplierId.message}</p>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="payable-creditor-name">Nombre del acreedor</Label>
              <Input id="payable-creditor-name" {...register("creditorName")} />
              {errors.creditorName ? (
                <p className="text-sm text-destructive">{errors.creditorName.message}</p>
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="payable-amount">Monto (Bs.)</Label>
              <Input id="payable-amount" type="number" step="0.01" {...register("amountBOB")} />
              {errors.amountBOB ? (
                <p className="text-sm text-destructive">{errors.amountBOB.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="payable-due-date">Fecha de vencimiento</Label>
              <Input id="payable-due-date" type="date" {...register("dueDate")} />
              {errors.dueDate ? (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="payable-category">Categoría</Label>
              <Input id="payable-category" {...register("category")} />
              {errors.category ? (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="payable-invoice-number">N° de factura (opcional)</Label>
              <Input id="payable-invoice-number" {...register("invoiceNumber")} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payable-notes">Notas</Label>
            <Textarea id="payable-notes" rows={3} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Crear cuenta por pagar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
