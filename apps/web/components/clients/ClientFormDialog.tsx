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

import type { ClientInput } from "@/hooks/use-clients";
import {
  CLIENT_DOCUMENT_TYPES,
  CLIENT_DOCUMENT_TYPE_LABELS,
  DEFAULT_CLIENT_CITY,
  type Client,
  type ClientDocumentType,
} from "@/lib/client-types";

const NAME_REQUIRED_MESSAGE = "El nombre es obligatorio.";
const INVALID_EMAIL_MESSAGE = "Ingresa un correo electrónico válido.";
const SAVE_ERROR_MESSAGE = "No se pudo guardar el cliente. Intenta nuevamente.";

const clientFormSchema = z.object({
  name: z.string().min(1, NAME_REQUIRED_MESSAGE),
  documentType: z.enum(CLIENT_DOCUMENT_TYPES),
  documentNumber: z.string(),
  phone: z.string(),
  email: z.string().email(INVALID_EMAIL_MESSAGE).or(z.literal("")),
  address: z.string(),
  neighborhood: z.string(),
  city: z.string(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const EMPTY_VALUES: ClientFormValues = {
  name: "",
  documentType: "CI",
  documentNumber: "",
  phone: "",
  email: "",
  address: "",
  neighborhood: "",
  city: DEFAULT_CLIENT_CITY,
};

function toFormValues(client: Client): ClientFormValues {
  return {
    name: client.name,
    documentType: client.documentType,
    documentNumber: client.documentNumber,
    phone: client.phone,
    email: client.email,
    address: client.address,
    neighborhood: client.neighborhood,
    city: client.city,
  };
}

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  isCreating: boolean;
  isUpdating: boolean;
  onCreate: (input: ClientInput) => Promise<void>;
  onUpdate: (clientId: string, input: ClientInput) => Promise<void>;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  isCreating,
  isUpdating,
  onCreate,
  onUpdate,
}: ClientFormDialogProps) {
  const isEditMode = client !== null;
  const isSaving = isEditMode ? isUpdating : isCreating;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(client ? toFormValues(client) : EMPTY_VALUES);
      setErrorMessage(null);
    }
  }, [open, client, reset]);

  const onSubmit = async (values: ClientFormValues) => {
    setErrorMessage(null);

    try {
      if (isEditMode && client) {
        await onUpdate(client.id, values);
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-form-name">Nombre</Label>
            <Input id="client-form-name" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-form-document-type">Tipo de documento</Label>
              <Select
                modal={false}
                value={watch("documentType")}
                onValueChange={(value) =>
                  setValue("documentType", (value ?? "CI") as ClientDocumentType)
                }
              >
                <SelectTrigger id="client-form-document-type">
                  <SelectValue>
                    {() => CLIENT_DOCUMENT_TYPE_LABELS[watch("documentType")]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_DOCUMENT_TYPES.map((documentType) => (
                    <SelectItem key={documentType} value={documentType}>
                      {CLIENT_DOCUMENT_TYPE_LABELS[documentType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="client-form-document-number">Número de documento</Label>
              <Input id="client-form-document-number" {...register("documentNumber")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="client-form-phone">Teléfono</Label>
              <Input id="client-form-phone" {...register("phone")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="client-form-email">Correo electrónico</Label>
              <Input id="client-form-email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="client-form-neighborhood">Barrio</Label>
              <Input id="client-form-neighborhood" {...register("neighborhood")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="client-form-city">Ciudad</Label>
              <Input id="client-form-city" {...register("city")} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="client-form-address">Dirección</Label>
            <Input id="client-form-address" {...register("address")} />
          </div>

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
                "Crear cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
