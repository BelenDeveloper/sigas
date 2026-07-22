"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ProjectDetail } from "@/hooks/use-projects";

const MIN_CANCELLATION_REASON_LENGTH = 20;
const REASON_TOO_SHORT_MESSAGE = `Ingresa un motivo de al menos ${MIN_CANCELLATION_REASON_LENGTH} caracteres.`;
const WARNING_MESSAGE = "Esta acción no se puede deshacer. El proyecto quedará archivado con estado cancelado.";
const SAVE_ERROR_MESSAGE = "No se pudo cancelar el proyecto. Intenta nuevamente.";

const cancelProjectSchema = z.object({
  cancellationReason: z.string().trim().min(MIN_CANCELLATION_REASON_LENGTH, REASON_TOO_SHORT_MESSAGE),
});

type CancelProjectFormValues = z.infer<typeof cancelProjectSchema>;

const EMPTY_VALUES: CancelProjectFormValues = { cancellationReason: "" };

interface CancelProjectDialogProps {
  project: ProjectDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCancelling: boolean;
  onConfirm: (cancellationReason: string) => Promise<void>;
}

export function CancelProjectDialog({
  project,
  open,
  onOpenChange,
  isCancelling,
  onConfirm,
}: CancelProjectDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<CancelProjectFormValues>({
    resolver: zodResolver(cancelProjectSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES);
      setErrorMessage(null);
    }
  }, [open, reset]);

  const onSubmit = async (values: CancelProjectFormValues) => {
    setErrorMessage(null);

    try {
      await onConfirm(values.cancellationReason);
      onOpenChange(false);
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar proyecto</DialogTitle>
          <DialogDescription>{project.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {WARNING_MESSAGE}
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cancel-project-reason">Motivo de la cancelación</Label>
            <Textarea id="cancel-project-reason" rows={4} {...register("cancellationReason")} />
            {errors.cancellationReason ? (
              <p className="text-sm text-destructive">{errors.cancellationReason.message}</p>
            ) : null}
          </div>

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={isCancelling}>
              {isCancelling ? <Loader2 className="size-4 animate-spin" /> : "Confirmar cancelación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
