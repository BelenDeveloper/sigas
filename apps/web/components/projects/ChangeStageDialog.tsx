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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CANCELLED_STAGE_KEY, getNextStage, type ProjectStageKey } from "@/lib/constants/project-stages";
import type { Project } from "@/lib/mocks/projects.mock";

const NOTE_REQUIRED_FOR_CANCEL_MESSAGE = "Ingresa un motivo para cancelar el proyecto.";
const CANCEL_OPTION_LABEL = "Cancelar proyecto";

type StageDecision = "advance" | "cancel";
const DEFAULT_DECISION: StageDecision = "advance";

const changeStageSchema = z
  .object({
    decision: z.enum(["advance", "cancel"]),
    note: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.decision === "cancel" && values.note.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NOTE_REQUIRED_FOR_CANCEL_MESSAGE,
        path: ["note"],
      });
    }
  });

type ChangeStageFormValues = z.infer<typeof changeStageSchema>;

const EMPTY_VALUES: ChangeStageFormValues = { decision: DEFAULT_DECISION, note: "" };

interface ChangeStageDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (nextStage: ProjectStageKey, note: string) => void;
}

export function ChangeStageDialog({ project, open, onOpenChange, onConfirm }: ChangeStageDialogProps) {
  const nextStage = getNextStage(project.stage);

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ChangeStageFormValues>({
    resolver: zodResolver(changeStageSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES);
    }
  }, [open, reset]);

  const decision = watch("decision");

  const onSubmit = (values: ChangeStageFormValues) => {
    const resolvedStage: ProjectStageKey =
      values.decision === "cancel" ? CANCELLED_STAGE_KEY : (nextStage?.key ?? CANCELLED_STAGE_KEY);

    onConfirm(resolvedStage, values.note);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar etapa</DialogTitle>
          <DialogDescription>{project.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="change-stage-decision">Nueva etapa</Label>
            <Select
              modal={false}
              value={decision}
              onValueChange={(value) => setValue("decision", (value ?? DEFAULT_DECISION) as StageDecision)}
            >
              <SelectTrigger id="change-stage-decision">
                <SelectValue>
                  {() => (decision === "cancel" ? CANCEL_OPTION_LABEL : (nextStage?.label ?? CANCEL_OPTION_LABEL))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {nextStage ? <SelectItem value="advance">{nextStage.label}</SelectItem> : null}
                <SelectItem value="cancel">{CANCEL_OPTION_LABEL}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="change-stage-note">
              Nota {decision === "cancel" ? "(obligatoria)" : "(opcional)"}
            </Label>
            <Textarea id="change-stage-note" rows={3} {...register("note")} />
            {errors.note ? <p className="text-sm text-destructive">{errors.note.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Confirmar cambio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
