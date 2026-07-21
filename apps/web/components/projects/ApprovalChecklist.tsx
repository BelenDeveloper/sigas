"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { GripVertical, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { ProjectApprovalStep } from "@/hooks/use-projects";

import { ChecklistItemEditor } from "./ChecklistItemEditor";

const NO_STEPS_MESSAGE = "Todavía no hay pasos en el checklist.";
const DELETE_CONFIRM_MESSAGE = "¿Eliminar este paso del checklist?";

interface ApprovalChecklistProps {
  steps: ProjectApprovalStep[];
  togglingChecklistItemId: string | null;
  removingChecklistItemId: string | null;
  onToggleStep: (checklistItemId: string, nextIsCompleted: boolean) => void;
  onEditDescription: (checklistItemId: string, description: string) => void;
  onRemoveStep: (checklistItemId: string) => void;
  onReorderSteps: (orderedIds: string[]) => void;
  onAddStep: () => void;
}

export function ApprovalChecklist({
  steps,
  togglingChecklistItemId,
  removingChecklistItemId,
  onToggleStep,
  onEditDescription,
  onRemoveStep,
  onReorderSteps,
  onAddStep,
}: ApprovalChecklistProps) {
  const [orderedSteps, setOrderedSteps] = useState(steps);

  useEffect(() => {
    setOrderedSteps(steps);
  }, [steps]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedSteps.findIndex((step) => step.id === active.id);
    const newIndex = orderedSteps.findIndex((step) => step.id === over.id);
    const newOrder = arrayMove(orderedSteps, oldIndex, newIndex);

    setOrderedSteps(newOrder);
    onReorderSteps(newOrder.map((step) => step.id));
  };

  const handleRemove = (checklistItemId: string) => {
    if (window.confirm(DELETE_CONFIRM_MESSAGE)) {
      onRemoveStep(checklistItemId);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {orderedSteps.length === 0 ? <p className="text-sm text-muted-foreground">{NO_STEPS_MESSAGE}</p> : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedSteps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {orderedSteps.map((step) => (
              <SortableChecklistItem
                key={step.id}
                step={step}
                isToggling={togglingChecklistItemId === step.id}
                isRemoving={removingChecklistItemId === step.id}
                onToggle={() => onToggleStep(step.id, !step.isCompleted)}
                onEditDescription={(description) => onEditDescription(step.id, description)}
                onRemove={() => handleRemove(step.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="outline" size="sm" className="w-fit" onClick={onAddStep}>
        <Plus className="size-4" />
        Agregar paso
      </Button>
    </div>
  );
}

interface SortableChecklistItemProps {
  step: ProjectApprovalStep;
  isToggling: boolean;
  isRemoving: boolean;
  onToggle: () => void;
  onEditDescription: (description: string) => void;
  onRemove: () => void;
}

function SortableChecklistItem({
  step,
  isToggling,
  isRemoving,
  onToggle,
  onEditDescription,
  onRemove,
}: SortableChecklistItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <Checkbox checked={step.isCompleted} disabled={isToggling} onCheckedChange={onToggle} />

      <ChecklistItemEditor description={step.description} isCompleted={step.isCompleted} onSave={onEditDescription} />

      {isToggling || isRemoving ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <Button variant="ghost" size="icon-sm" onClick={onRemove}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
