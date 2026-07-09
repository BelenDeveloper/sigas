"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/hooks/use-auth";

const EMAIL_INVALID_MESSAGE = "Ingresa un correo electrónico válido.";
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_TOO_SHORT_MESSAGE = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;

const loginFormSchema = z.object({
  email: z.string().email(EMAIL_INVALID_MESSAGE),
  password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_TOO_SHORT_MESSAGE),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const { login, isLoading, errorMessage } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    void login(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@sigas.bo"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Iniciar sesión"}
      </Button>
    </form>
  );
}
