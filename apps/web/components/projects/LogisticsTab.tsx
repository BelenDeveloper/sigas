"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

import type { TaskInput } from "@/hooks/use-projects";
import type { Project } from "@/lib/mocks/projects.mock";

import { AddTaskDialog } from "./AddTaskDialog";
import { LogisticsTaskList } from "./LogisticsTaskList";

interface LogisticsTabProps {
  project: Project;
  onAddTask: (input: TaskInput) => void;
  onToggleTaskCompleted: (taskId: string) => void;
}

export function LogisticsTab({ project, onAddTask, onToggleTaskCompleted }: LogisticsTabProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setIsAddTaskOpen(true)}>
          <Plus className="size-4" />
          Agregar tarea
        </Button>
      </div>

      <LogisticsTaskList tasks={project.tasks} onToggleTaskCompleted={onToggleTaskCompleted} />

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        currentStage={project.stage}
        onCreate={onAddTask}
      />
    </div>
  );
}
