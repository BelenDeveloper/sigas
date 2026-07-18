import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Loader2 } from "lucide-react";

import type { ProjectApprovalStep } from "@/hooks/use-projects";

interface ApprovalChecklistProps {
  steps: ProjectApprovalStep[];
  togglingChecklistItemId: string | null;
  onToggleStep: (checklistItemId: string, nextIsCompleted: boolean) => void;
}

export function ApprovalChecklist({ steps, togglingChecklistItemId, onToggleStep }: ApprovalChecklistProps) {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3 rounded-md border border-border p-3">
          <Checkbox
            checked={step.isCompleted}
            disabled={togglingChecklistItemId === step.id}
            onCheckedChange={() => onToggleStep(step.id, !step.isCompleted)}
          />
          <span
            className={
              step.isCompleted ? "text-sm text-muted-foreground line-through" : "text-sm text-foreground"
            }
          >
            {step.description}
          </span>
          {togglingChecklistItemId === step.id ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
