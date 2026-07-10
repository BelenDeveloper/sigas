import { Badge } from "@repo/ui/components/ui/badge";
import { Check } from "lucide-react";

import { getStageByKey, PIPELINE_STAGES, type ProjectStageKey } from "@/lib/constants/project-stages";

const CANCELLED_LABEL = "Cancelado";

type PipelineStepStatus = "completed" | "current" | "future";

const STEP_CIRCLE_CLASSES: Record<PipelineStepStatus, string> = {
  completed: "border-emerald-600 bg-emerald-600 text-white",
  current: "border-amber-500 bg-amber-500 text-white",
  future: "border-muted-foreground/40 bg-transparent text-muted-foreground",
};

const STEP_LABEL_CLASSES: Record<PipelineStepStatus, string> = {
  completed: "text-emerald-700 dark:text-emerald-400",
  current: "text-amber-700 dark:text-amber-400",
  future: "text-muted-foreground",
};

function getStepStatus(stepNumber: number, currentStep: number | null): PipelineStepStatus {
  if (currentStep === null) {
    return "future";
  }

  if (stepNumber < currentStep) {
    return "completed";
  }

  if (stepNumber === currentStep) {
    return "current";
  }

  return "future";
}

interface ProjectStagePipelineProps {
  stage: ProjectStageKey;
}

export function ProjectStagePipeline({ stage }: ProjectStagePipelineProps) {
  const isCancelled = stage === "cancelled";
  const currentStep = isCancelled ? null : getStageByKey(stage).step;

  return (
    <div className="flex flex-col gap-3">
      {isCancelled ? <Badge className="w-fit bg-red-100 text-red-800">{CANCELLED_LABEL}</Badge> : null}

      <div className="flex gap-6 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((pipelineStage) => {
          const status = getStepStatus(pipelineStage.step ?? 0, currentStep);

          return (
            <div key={pipelineStage.key} className="flex min-w-24 flex-col items-center gap-2">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${STEP_CIRCLE_CLASSES[status]}`}
              >
                {status === "completed" ? <Check className="size-4" /> : pipelineStage.step}
              </div>
              <span className={`text-center text-xs font-medium ${STEP_LABEL_CLASSES[status]}`}>
                {pipelineStage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
