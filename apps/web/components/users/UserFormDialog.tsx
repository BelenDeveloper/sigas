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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { UserProfileInput, UserProfileUpdateInput } from "@/hooks/use-users";
import {
  ADMIN_USER_ROLES,
  ADMIN_USER_ROLE_LABELS,
  type AdminUser,
  type AdminUserRole,
  type ModulePermission,
} from "@/lib/user-permissions";
import { buildEmptyPermissions } from "@/lib/permission-helpers";

import { PermissionsEditor } from "./PermissionsEditor";

const NAME_REQUIRED_MESSAGE = "El nombre es obligatorio.";
const INVALID_EMAIL_MESSAGE = "Ingresa un correo electrónico válido.";
const PASSWORD_REQUIRED_MESSAGE = "La contraseña es obligatoria.";
const MIN_PASSWORD_LENGTH = 6;
const SAVE_ERROR_MESSAGE = "No se pudo guardar el usuario. Intenta nuevamente.";

const DEFAULT_ROLE: AdminUserRole = "sales";

function buildProfileSchema(isEditMode: boolean) {
  return z
    .object({
      name: z.string().min(1, NAME_REQUIRED_MESSAGE),
      email: z.string().email(INVALID_EMAIL_MESSAGE),
      password: z.string(),
      role: z.enum(["admin", "logistics", "sales", "custom"]),
    })
    .superRefine((values, ctx) => {
      if (!isEditMode && values.password.trim().length < MIN_PASSWORD_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: PASSWORD_REQUIRED_MESSAGE,
          path: ["password"],
        });
      }
    });
}

type ProfileFormValues = z.infer<ReturnType<typeof buildProfileSchema>>;

const EMPTY_VALUES: ProfileFormValues = {
  name: "",
  email: "",
  password: "",
  role: DEFAULT_ROLE,
};

function toFormValues(user: AdminUser): ProfileFormValues {
  return { name: user.name, email: user.email, password: "", role: user.role };
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  isCreating: boolean;
  isUpdating: boolean;
  onCreate: (profile: UserProfileInput, permissions: ModulePermission[]) => Promise<void>;
  onUpdate: (
    userId: string,
    profile: UserProfileUpdateInput,
    permissions: ModulePermission[],
  ) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  isCreating,
  isUpdating,
  onCreate,
  onUpdate,
}: UserFormDialogProps) {
  const isEditMode = user !== null;
  const isSaving = isEditMode ? isUpdating : isCreating;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(buildProfileSchema(isEditMode)),
    defaultValues: EMPTY_VALUES,
  });

  const [permissions, setPermissions] = useState<ModulePermission[]>(buildEmptyPermissions());

  useEffect(() => {
    if (open) {
      reset(user ? toFormValues(user) : EMPTY_VALUES);
      setPermissions(user ? user.permissions : buildEmptyPermissions());
      setErrorMessage(null);
    }
  }, [open, user, reset]);

  const role = watch("role");

  const onSubmit = async (values: ProfileFormValues) => {
    setErrorMessage(null);

    try {
      if (isEditMode && user) {
        await onUpdate(user.id, { name: values.name, role: values.role }, permissions);
      } else {
        await onCreate(values, permissions);
      }

      onOpenChange(false);
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="permissions">Permisos</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="user-form-name">Nombre</Label>
                <Input id="user-form-name" {...register("name")} />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="user-form-email">Correo electrónico</Label>
                <Input
                  id="user-form-email"
                  type="email"
                  readOnly={isEditMode}
                  disabled={isEditMode}
                  {...register("email")}
                />
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
              </div>

              {!isEditMode ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="user-form-password">Contraseña</Label>
                  <Input id="user-form-password" type="password" {...register("password")} />
                  {errors.password ? (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label htmlFor="user-form-role">Rol</Label>
                <Select
                  modal={false}
                  value={role}
                  onValueChange={(value) => setValue("role", (value ?? DEFAULT_ROLE) as AdminUserRole)}
                >
                  <SelectTrigger id="user-form-role">
                    <SelectValue>{() => ADMIN_USER_ROLE_LABELS[role]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_USER_ROLES.map((roleOption) => (
                      <SelectItem key={roleOption} value={roleOption}>
                        {ADMIN_USER_ROLE_LABELS[roleOption]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="pt-4">
              <PermissionsEditor permissions={permissions} onPermissionsChange={setPermissions} />
            </TabsContent>
          </Tabs>

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
                "Crear usuario"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
