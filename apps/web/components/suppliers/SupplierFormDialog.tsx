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
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { SupplierInput } from "@/hooks/use-suppliers";
import { DEFAULT_SUPPLIER_COUNTRY, type Supplier } from "@/lib/mocks/suppliers.mock";

const COMPANY_NAME_REQUIRED_MESSAGE = "El nombre de la empresa es obligatorio.";
const INVALID_EMAIL_MESSAGE = "Ingresa un correo electrónico válido.";

const supplierFormSchema = z.object({
  companyName: z.string().min(1, COMPANY_NAME_REQUIRED_MESSAGE),
  contactName: z.string(),
  nit: z.string(),
  phone: z.string(),
  email: z.string().email(INVALID_EMAIL_MESSAGE).or(z.literal("")),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  notes: z.string(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

const EMPTY_VALUES: SupplierFormValues = {
  companyName: "",
  contactName: "",
  nit: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: DEFAULT_SUPPLIER_COUNTRY,
  notes: "",
};

function toFormValues(supplier: Supplier): SupplierFormValues {
  return {
    companyName: supplier.companyName,
    contactName: supplier.contactName,
    nit: supplier.nit,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    city: supplier.city,
    country: supplier.country,
    notes: supplier.notes,
  };
}

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onCreate: (input: SupplierInput) => void;
  onUpdate: (supplierId: string, input: SupplierInput) => void;
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onCreate,
  onUpdate,
}: SupplierFormDialogProps) {
  const isEditMode = supplier !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(supplier ? toFormValues(supplier) : EMPTY_VALUES);
    }
  }, [open, supplier, reset]);

  const onSubmit = (values: SupplierFormValues) => {
    if (isEditMode && supplier) {
      onUpdate(supplier.id, values);
    } else {
      onCreate(values);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="supplier-form-company-name">Nombre de la empresa</Label>
            <Input id="supplier-form-company-name" {...register("companyName")} />
            {errors.companyName ? (
              <p className="text-sm text-destructive">{errors.companyName.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier-form-contact-name">Persona de contacto</Label>
              <Input id="supplier-form-contact-name" {...register("contactName")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier-form-nit">NIT</Label>
              <Input id="supplier-form-nit" {...register("nit")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier-form-phone">Teléfono</Label>
              <Input id="supplier-form-phone" {...register("phone")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier-form-email">Correo electrónico</Label>
              <Input id="supplier-form-email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier-form-city">Ciudad</Label>
              <Input id="supplier-form-city" {...register("city")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier-form-country">País</Label>
              <Input id="supplier-form-country" {...register("country")} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="supplier-form-address">Dirección</Label>
            <Input id="supplier-form-address" {...register("address")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="supplier-form-notes">Notas</Label>
            <Textarea id="supplier-form-notes" rows={3} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              {isEditMode ? "Guardar cambios" : "Crear proveedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
