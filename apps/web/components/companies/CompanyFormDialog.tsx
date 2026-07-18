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
import { Switch } from "@repo/ui/components/ui/switch";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { CompanyInput } from "@/hooks/use-companies";
import type { Company } from "@/lib/company-types";

const NAME_REQUIRED_MESSAGE = "El nombre de la empresa es obligatorio.";
const SAVE_ERROR_MESSAGE = "No se pudo guardar la empresa. Intenta nuevamente.";

const companyFormSchema = z.object({
  name: z.string().min(1, NAME_REQUIRED_MESSAGE),
  description: z.string(),
  isActive: z.boolean(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const EMPTY_VALUES: CompanyFormValues = { name: "", description: "", isActive: true };

function toFormValues(company: Company): CompanyFormValues {
  return {
    name: company.name,
    description: company.description ?? "",
    isActive: company.isActive,
  };
}

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  isCreating: boolean;
  isUpdating: boolean;
  onCreate: (input: CompanyInput) => Promise<void>;
  onUpdate: (companyId: string, input: CompanyInput) => Promise<void>;
}

export function CompanyFormDialog({
  open,
  onOpenChange,
  company,
  isCreating,
  isUpdating,
  onCreate,
  onUpdate,
}: CompanyFormDialogProps) {
  const isEditMode = company !== null;
  const isSaving = isEditMode ? isUpdating : isCreating;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(company ? toFormValues(company) : EMPTY_VALUES);
      setErrorMessage(null);
    }
  }, [open, company, reset]);

  const isActive = watch("isActive");

  const onSubmit = async (values: CompanyFormValues) => {
    setErrorMessage(null);

    try {
      if (isEditMode && company) {
        await onUpdate(company.id, values);
      } else {
        await onCreate(values);
      }

      onOpenChange(false);
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar empresa" : "Nueva empresa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-form-name">Nombre</Label>
            <Input id="company-form-name" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company-form-description">Descripción</Label>
            <Textarea id="company-form-description" rows={3} {...register("description")} />
          </div>

          {isEditMode ? (
            <div className="flex items-center gap-2">
              <Switch
                id="company-form-is-active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="company-form-is-active">Empresa activa</Label>
            </div>
          ) : null}

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEditMode ? (
                "Guardar cambios"
              ) : (
                "Crear empresa"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
