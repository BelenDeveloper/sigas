"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { CompanyInfo } from "@/lib/mocks/settings.mock";

const NAME_REQUIRED_MESSAGE = "El nombre de la empresa es obligatorio.";
const INVALID_EMAIL_MESSAGE = "Ingresa un correo electrónico válido.";
const NO_LOGO_SELECTED_LABEL = "Ningún archivo seleccionado";

const companyInfoSchema = z.object({
  name: z.string().min(1, NAME_REQUIRED_MESSAGE),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  email: z.string().email(INVALID_EMAIL_MESSAGE).or(z.literal("")),
});

type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;

function toFormValues(companyInfo: CompanyInfo): CompanyInfoFormValues {
  return {
    name: companyInfo.name,
    phone: companyInfo.phone,
    address: companyInfo.address,
    city: companyInfo.city,
    email: companyInfo.email,
  };
}

interface CompanyInfoFormProps {
  companyInfo: CompanyInfo;
  onUpdate: (input: CompanyInfo) => void;
}

export function CompanyInfoForm({ companyInfo, onUpdate }: CompanyInfoFormProps) {
  const [logoFileName, setLogoFileName] = useState(companyInfo.logoFileName);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: toFormValues(companyInfo),
  });

  useEffect(() => {
    reset(toFormValues(companyInfo));
    setLogoFileName(companyInfo.logoFileName);
  }, [companyInfo, reset]);

  const onSubmit = (values: CompanyInfoFormValues) => {
    onUpdate({ ...values, logoFileName });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la empresa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-info-name">Nombre de la empresa</Label>
            <Input id="company-info-name" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="company-info-phone">Teléfono</Label>
              <Input id="company-info-phone" {...register("phone")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="company-info-email">Correo electrónico</Label>
              <Input id="company-info-email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="company-info-city">Ciudad</Label>
              <Input id="company-info-city" {...register("city")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="company-info-address">Dirección</Label>
              <Input id="company-info-address" {...register("address")} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company-info-logo">Logo</Label>
            <Input
              id="company-info-logo"
              type="file"
              accept="image/*"
              onChange={(event) => setLogoFileName(event.target.files?.[0]?.name ?? "")}
            />
            <p className="text-sm text-muted-foreground">{logoFileName || NO_LOGO_SELECTED_LABEL}</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Guardar cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
