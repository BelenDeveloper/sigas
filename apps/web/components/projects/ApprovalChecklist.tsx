import { Checkbox } from "@repo/ui/components/ui/checkbox";

import type { ProjectApprovalStep } from "@/hooks/use-projects";

interface ApprovalChecklistProps {
  steps: ProjectApprovalStep[];
  onToggleStep: (checklistItemId: string, nextIsCompleted: boolean) => void;
}

export function ApprovalChecklist({ steps, onToggleStep }: ApprovalChecklistProps) {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3 rounded-md border border-border p-3">
          <Checkbox
            checked={step.isCompleted}
            onCheckedChange={() => onToggleStep(step.id, !step.isCompleted)}
          />
          <span
            className={
              step.isCompleted ? "text-sm text-muted-foreground line-through" : "text-sm text-foreground"
            }
          >
            {step.description}
          </span>
        </div>
      ))}
    </div>
  );
}
