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
import { getNextStage, type ProjectStageKey } from "@/lib/constants/project-stages";

const SAVE_ERROR_MESSAGE = "No se pudo cambiar la etapa. Intenta nuevamente.";

const changeStageSchema = z.object({
  note: z.string(),
});

type ChangeStageFormValues = z.infer<typeof changeStageSchema>;

const EMPTY_VALUES: ChangeStageFormValues = { note: "" };

interface ChangeStageDialogProps {
  project: ProjectDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isChangingStage: boolean;
  onConfirm: (nextStage: ProjectStageKey, note: string) => Promise<void>;
}

export function ChangeStageDialog({
  project,
  open,
  onOpenChange,
  isChangingStage,
  onConfirm,
}: ChangeStageDialogProps) {
  const nextStage = getNextStage(project.stage);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handleSubmit, register, reset } = useForm<ChangeStageFormValues>({
    resolver: zodResolver(changeStageSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES);
      setErrorMessage(null);
    }
  }, [open, reset]);

  const onSubmit = async (values: ChangeStageFormValues) => {
    if (!nextStage) {
      return;
    }

    setErrorMessage(null);

    try {
      await onConfirm(nextStage.key, values.note);
      onOpenChange(false);
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar etapa</DialogTitle>
          <DialogDescription>{project.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">Nueva etapa</span>
            <span className="text-sm text-muted-foreground">{nextStage?.label}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="change-stage-note">Nota (opcional)</Label>
            <Textarea id="change-stage-note" rows={3} {...register("note")} />
          </div>

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isChangingStage || !nextStage}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isChangingStage ? <Loader2 className="size-4 animate-spin" /> : "Confirmar cambio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
