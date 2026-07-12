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
import { Switch } from "@repo/ui/components/ui/switch";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ProjectInput } from "@/hooks/use-projects";
import type { Client } from "@/lib/client-types";
import {
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  type ProjectCategory,
  type ProjectCompany,
} from "@/lib/mocks/projects.mock";

const NAME_REQUIRED_MESSAGE = "El nombre del proyecto es obligatorio.";
const COMPANY_REQUIRED_MESSAGE = "Selecciona una empresa.";
const CLIENT_REQUIRED_MESSAGE = "Selecciona un cliente.";
const START_DATE_REQUIRED_MESSAGE = "La fecha de inicio es obligatoria.";
const TOTAL_VALUE_POSITIVE_MESSAGE = "El valor total debe ser mayor a cero.";
const SELECT_COMPANY_PLACEHOLDER = "Selecciona una empresa";
const SELECT_CLIENT_PLACEHOLDER = "Selecciona un cliente";

const DEFAULT_CATEGORY: ProjectCategory = "domestic";

const projectFormSchema = z.object({
  name: z.string().min(1, NAME_REQUIRED_MESSAGE),
  category: z.enum(["domestic", "commercial", "industrial"]),
  companyId: z.string().min(1, COMPANY_REQUIRED_MESSAGE),
  clientId: z.string().min(1, CLIENT_REQUIRED_MESSAGE),
  isPrivate: z.boolean(),
  totalValueBOB: z.coerce.number().positive(TOTAL_VALUE_POSITIVE_MESSAGE),
  firstPaymentAmountBOB: z.coerce.number().min(0),
  secondPaymentAmountBOB: z.coerce.number().min(0),
  startDate: z.string().min(1, START_DATE_REQUIRED_MESSAGE),
  description: z.string(),
});

type ProjectFormInput = z.input<typeof projectFormSchema>;
type ProjectFormValues = z.infer<typeof projectFormSchema>;

const EMPTY_VALUES: ProjectFormInput = {
  name: "",
  category: DEFAULT_CATEGORY,
  companyId: "",
  clientId: "",
  isPrivate: false,
  totalValueBOB: 0,
  firstPaymentAmountBOB: 0,
  secondPaymentAmountBOB: 0,
  startDate: "",
  description: "",
};

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: ProjectCompany[];
  clients: Client[];
  onCreate: (input: ProjectInput) => void;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  companies,
  clients,
  onCreate,
}: ProjectFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES);
    }
  }, [open, reset]);

  const category = watch("category");
  const companyId = watch("companyId");
  const clientId = watch("clientId");
  const isPrivate = watch("isPrivate");
  const selectedCompany = companies.find((company) => company.id === companyId);
  const selectedClient = clients.find((client) => client.id === clientId);

  const onSubmit = (values: ProjectFormValues) => {
    onCreate(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-form-name">Nombre</Label>
            <Input id="project-form-name" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-form-category">Categoría</Label>
              <Select
                modal={false}
                value={category}
                onValueChange={(value) =>
                  setValue("category", (value ?? DEFAULT_CATEGORY) as ProjectCategory)
                }
              >
                <SelectTrigger id="project-form-category">
                  <SelectValue>{() => PROJECT_CATEGORY_LABELS[category]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((categoryOption) => (
                    <SelectItem key={categoryOption} value={categoryOption}>
                      {PROJECT_CATEGORY_LABELS[categoryOption]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="project-form-company">Empresa</Label>
              <Select modal={false} value={companyId} onValueChange={(value) => setValue("companyId", value ?? "")}>
                <SelectTrigger id="project-form-company">
                  <SelectValue>{() => selectedCompany?.name ?? SELECT_COMPANY_PLACEHOLDER}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId ? (
                <p className="text-sm text-destructive">{errors.companyId.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="project-form-client">Cliente</Label>
              <Select modal={false} value={clientId} onValueChange={(value) => setValue("clientId", value ?? "")}>
                <SelectTrigger id="project-form-client">
                  <SelectValue>{() => selectedClient?.name ?? SELECT_CLIENT_PLACEHOLDER}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId ? (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="project-form-is-private"
              checked={isPrivate}
              onCheckedChange={(checked) => setValue("isPrivate", checked)}
            />
            <Label htmlFor="project-form-is-private">Proyecto privado</Label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-form-total-value">Valor total (Bs.)</Label>
              <Input id="project-form-total-value" type="number" step="0.01" {...register("totalValueBOB")} />
              {errors.totalValueBOB ? (
                <p className="text-sm text-destructive">{errors.totalValueBOB.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="project-form-first-payment">Primer pago (Bs.)</Label>
              <Input
                id="project-form-first-payment"
                type="number"
                step="0.01"
                {...register("firstPaymentAmountBOB")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="project-form-second-payment">Segundo pago (Bs.)</Label>
              <Input
                id="project-form-second-payment"
                type="number"
                step="0.01"
                {...register("secondPaymentAmountBOB")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-form-start-date">Fecha de inicio</Label>
            <Input id="project-form-start-date" type="date" {...register("startDate")} />
            {errors.startDate ? (
              <p className="text-sm text-destructive">{errors.startDate.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-form-description">Descripción</Label>
            <Textarea id="project-form-description" rows={3} {...register("description")} />
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Crear proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
