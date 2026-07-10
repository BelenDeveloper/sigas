import { Checkbox } from "@repo/ui/components/ui/checkbox";

import { APPROVAL_CHECKLIST_STEPS } from "@/lib/constants/project-stages";
import type { ProjectApprovalStep } from "@/lib/mocks/projects.mock";

interface ApprovalChecklistProps {
  steps: ProjectApprovalStep[];
  onToggleStep: (stepKey: string) => void;
}

export function ApprovalChecklist({ steps, onToggleStep }: ApprovalChecklistProps) {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => {
        const stepDefinition = APPROVAL_CHECKLIST_STEPS.find((candidate) => candidate.key === step.key);

        return (
          <div key={step.key} className="flex items-center gap-3 rounded-md border border-border p-3">
            <Checkbox checked={step.isCompleted} onCheckedChange={() => onToggleStep(step.key)} />
            <span
              className={
                step.isCompleted
                  ? "text-sm text-muted-foreground line-through"
                  : "text-sm text-foreground"
              }
            >
              {stepDefinition?.label ?? step.key}
            </span>
          </div>
        );
      })}
    </div>
  );
}
