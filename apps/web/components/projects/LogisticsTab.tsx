"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

import type { ProjectDetail, TaskInput } from "@/hooks/use-projects";
import type { AdminUser } from "@/lib/user-permissions";

import { AddTaskDialog } from "./AddTaskDialog";
import { LogisticsTaskList } from "./LogisticsTaskList";

interface LogisticsTabProps {
  project: ProjectDetail;
  users: AdminUser[];
  canEdit: boolean;
  isAddingTask: boolean;
  completingTaskId: string | null;
  onAddTask: (input: TaskInput) => Promise<void>;
  onToggleTaskCompleted: (taskId: string) => void;
}

export function LogisticsTab({
  project,
  users,
  canEdit,
  isAddingTask,
  completingTaskId,
  onAddTask,
  onToggleTaskCompleted,
}: LogisticsTabProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {canEdit ? (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="size-4" />
            Agregar tarea
          </Button>
        </div>
      ) : null}

      <LogisticsTaskList
        tasks={project.tasks}
        users={users}
        completingTaskId={completingTaskId}
        onToggleTaskCompleted={onToggleTaskCompleted}
      />

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        currentStage={project.stage}
        users={users}
        isAddingTask={isAddingTask}
        onCreate={onAddTask}
      />
    </div>
  );
}
