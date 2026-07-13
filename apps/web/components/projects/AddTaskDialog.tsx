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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { TaskInput } from "@/hooks/use-projects";
import { getStageByKey, PROJECT_STAGES, type ProjectStageKey } from "@/lib/constants/project-stages";
import type { AdminUser } from "@/lib/user-permissions";

const DESCRIPTION_REQUIRED_MESSAGE = "La descripción es obligatoria.";
const ASSIGNEE_REQUIRED_MESSAGE = "Selecciona a quién se asigna la tarea.";
const SELECT_ASSIGNEE_PLACEHOLDER = "Selecciona una persona";

const PROJECT_STAGE_KEYS = PROJECT_STAGES.map((stage) => stage.key) as [
  ProjectStageKey,
  ...ProjectStageKey[],
];

const taskSchema = z.object({
  stage: z.enum(PROJECT_STAGE_KEYS),
  description: z.string().min(1, DESCRIPTION_REQUIRED_MESSAGE),
  assignedTo: z.string().min(1, ASSIGNEE_REQUIRED_MESSAGE),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStage: ProjectStageKey;
  users: AdminUser[];
  onCreate: (input: TaskInput) => void;
}

export function AddTaskDialog({ open, onOpenChange, currentStage, users, onCreate }: AddTaskDialogProps) {
  const emptyValues: TaskFormValues = { stage: currentStage, description: "", assignedTo: "" };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentStage, reset]);

  const stage = watch("stage");
  const assignedTo = watch("assignedTo");
  const selectedAssignee = users.find((user) => user.id === assignedTo);

  const onSubmit = (values: TaskFormValues) => {
    onCreate(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-form-stage">Etapa</Label>
            <Select
              modal={false}
              value={stage}
              onValueChange={(value) => setValue("stage", (value ?? currentStage) as ProjectStageKey)}
            >
              <SelectTrigger id="task-form-stage">
                <SelectValue>{() => getStageByKey(stage).label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STAGES.map((stageOption) => (
                  <SelectItem key={stageOption.key} value={stageOption.key}>
                    {stageOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-form-description">Descripción</Label>
            <Input id="task-form-description" {...register("description")} />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-form-assignee">Asignar a</Label>
            <Select
              modal={false}
              value={assignedTo}
              onValueChange={(value) => setValue("assignedTo", value ?? "")}
            >
              <SelectTrigger id="task-form-assignee">
                <SelectValue>{() => selectedAssignee?.name ?? SELECT_ASSIGNEE_PLACEHOLDER}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedTo ? (
              <p className="text-sm text-destructive">{errors.assignedTo.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Crear tarea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
