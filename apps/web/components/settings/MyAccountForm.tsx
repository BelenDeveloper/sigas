"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { MyAccountProfileInput } from "@/hooks/use-settings";

const NAME_REQUIRED_MESSAGE = "El nombre es obligatorio.";
const CURRENT_PASSWORD_REQUIRED_MESSAGE = "Ingresa tu contraseña actual.";
const PASSWORD_MIN_LENGTH_MESSAGE = "La nueva contraseña debe tener al menos 6 caracteres.";
const PASSWORDS_DO_NOT_MATCH_MESSAGE = "Las contraseñas no coinciden.";
const MIN_PASSWORD_LENGTH = 6;
const PASSWORD_CHANGED_MESSAGE = "Contraseña actualizada correctamente.";

const profileSchema = z.object({
  name: z.string().min(1, NAME_REQUIRED_MESSAGE),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, CURRENT_PASSWORD_REQUIRED_MESSAGE),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: PASSWORDS_DO_NOT_MATCH_MESSAGE,
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const EMPTY_PASSWORD_VALUES: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

interface MyAccountFormProps {
  name: string;
  email: string;
  onUpdateName: (input: MyAccountProfileInput) => void;
}

export function MyAccountForm({ name, email, onUpdateName }: MyAccountFormProps) {
  const [passwordChangedMessage, setPasswordChangedMessage] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name },
  });

  useEffect(() => {
    resetProfile({ name });
  }, [name, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_PASSWORD_VALUES,
  });

  const onSubmitProfile = (values: ProfileFormValues) => {
    onUpdateName(values);
  };

  const onSubmitPassword = () => {
    setPasswordChangedMessage(PASSWORD_CHANGED_MESSAGE);
    resetPassword(EMPTY_PASSWORD_VALUES);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="my-account-name">Nombre</Label>
              <Input id="my-account-name" {...registerProfile("name")} />
              {profileErrors.name ? (
                <p className="text-sm text-destructive">{profileErrors.name.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="my-account-email">Correo electrónico</Label>
              <Input id="my-account-email" value={email} readOnly disabled />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePasswordSubmit(onSubmitPassword)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="my-account-current-password">Contraseña actual</Label>
              <Input
                id="my-account-current-password"
                type="password"
                {...registerPassword("currentPassword")}
              />
              {passwordErrors.currentPassword ? (
                <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="my-account-new-password">Nueva contraseña</Label>
                <Input
                  id="my-account-new-password"
                  type="password"
                  {...registerPassword("newPassword")}
                />
                {passwordErrors.newPassword ? (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="my-account-confirm-password">Confirmar nueva contraseña</Label>
                <Input
                  id="my-account-confirm-password"
                  type="password"
                  {...registerPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword ? (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                ) : null}
              </div>
            </div>

            {passwordChangedMessage ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">{passwordChangedMessage}</p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
