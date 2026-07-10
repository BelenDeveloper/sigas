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
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { DocumentInput } from "@/hooks/use-projects";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { getStageByKey, PROJECT_STAGES, type ProjectStageKey } from "@/lib/constants/project-stages";

const FILE_NAME_REQUIRED_MESSAGE = "Ingresa un nombre para el documento.";

const PROJECT_STAGE_KEYS = PROJECT_STAGES.map((stage) => stage.key) as [
  ProjectStageKey,
  ...ProjectStageKey[],
];

const documentSchema = z.object({
  stage: z.enum(PROJECT_STAGE_KEYS),
  fileName: z.string().min(1, FILE_NAME_REQUIRED_MESSAGE),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStage: ProjectStageKey;
  onCreate: (input: DocumentInput) => void;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  currentStage,
  onCreate,
}: UploadDocumentDialogProps) {
  const authUser = useAtomValue(authUserAtom);
  const emptyValues: DocumentFormValues = { stage: currentStage, fileName: "" };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentStage, reset]);

  const stage = watch("stage");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setValue("fileName", selectedFile.name, { shouldValidate: true });
    }
  };

  const onSubmit = (values: DocumentFormValues) => {
    onCreate({ ...values, uploadedBy: authUser?.id ?? "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="document-form-stage">Etapa</Label>
            <Select
              modal={false}
              value={stage}
              onValueChange={(value) => setValue("stage", (value ?? currentStage) as ProjectStageKey)}
            >
              <SelectTrigger id="document-form-stage">
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
            <Label htmlFor="document-form-file">Archivo</Label>
            <Input id="document-form-file" type="file" onChange={handleFileChange} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="document-form-name">Nombre</Label>
            <Input id="document-form-name" {...register("fileName")} />
            {errors.fileName ? (
              <p className="text-sm text-destructive">{errors.fileName.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Subir documento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
