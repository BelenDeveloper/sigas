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

import type { ChecklistItemInput } from "@/hooks/use-projects";
import { CHECKLIST_CHANNEL_LABELS, CHECKLIST_CHANNELS, type ChecklistChannel } from "@/lib/checklist-channel";

const DESCRIPTION_REQUIRED_MESSAGE = "La descripción es obligatoria.";
const SAVE_ERROR_MESSAGE = "No se pudo guardar el paso. Intenta nuevamente.";
const NO_CHANNEL_OPTION = "none";
const NO_CHANNEL_LABEL = "Sin canal";

const checklistItemSchema = z.object({
  description: z.string().min(1, DESCRIPTION_REQUIRED_MESSAGE),
  channel: z.string(),
});

type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>;

const EMPTY_VALUES: ChecklistItemFormValues = { description: "", channel: NO_CHANNEL_OPTION };

interface AddChecklistItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdding: boolean;
  onCreate: (input: ChecklistItemInput) => Promise<void>;
}

export function AddChecklistItemDialog({ open, onOpenChange, isAdding, onCreate }: AddChecklistItemDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ChecklistItemFormValues>({
    resolver: zodResolver(checklistItemSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES);
      setErrorMessage(null);
    }
  }, [open, reset]);

  const channel = watch("channel");

  const onSubmit = async (values: ChecklistItemFormValues) => {
    setErrorMessage(null);

    try {
      await onCreate({
        description: values.description,
        channel: values.channel === NO_CHANNEL_OPTION ? undefined : (values.channel as ChecklistChannel),
      });
      onOpenChange(false);
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo paso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="checklist-item-form-description">Descripción</Label>
            <Input id="checklist-item-form-description" {...register("description")} />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="checklist-item-form-channel">Canal (opcional)</Label>
            <Select
              modal={false}
              value={channel}
              onValueChange={(value) => setValue("channel", value ?? NO_CHANNEL_OPTION)}
            >
              <SelectTrigger id="checklist-item-form-channel">
                <SelectValue>
                  {() =>
                    channel === NO_CHANNEL_OPTION
                      ? NO_CHANNEL_LABEL
                      : CHECKLIST_CHANNEL_LABELS[channel as ChecklistChannel]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CHANNEL_OPTION}>{NO_CHANNEL_LABEL}</SelectItem>
                {CHECKLIST_CHANNELS.map((channelOption) => (
                  <SelectItem key={channelOption} value={channelOption}>
                    {CHECKLIST_CHANNEL_LABELS[channelOption]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isAdding}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isAdding ? <Loader2 className="size-4 animate-spin" /> : "Agregar paso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
