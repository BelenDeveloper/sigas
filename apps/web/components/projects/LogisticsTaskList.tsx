import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Loader2 } from "lucide-react";

import type { ProjectTask } from "@/hooks/use-projects";
import { getStageByKey } from "@/lib/constants/project-stages";
import type { AdminUser } from "@/lib/user-permissions";

const NO_TASKS_MESSAGE = "Todavía no hay tareas registradas.";
const UNKNOWN_ASSIGNEE_LABEL = "—";

interface LogisticsTaskListProps {
  tasks: ProjectTask[];
  users: AdminUser[];
  completingTaskId: string | null;
  onToggleTaskCompleted: (taskId: string) => void;
}

export function LogisticsTaskList({
  tasks,
  users,
  completingTaskId,
  onToggleTaskCompleted,
}: LogisticsTaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">{NO_TASKS_MESSAGE}</p>;
  }

  const getUserName = (userId: string) => users.find((user) => user.id === userId)?.name ?? UNKNOWN_ASSIGNEE_LABEL;

  const stageKeys = Array.from(new Set(tasks.map((task) => task.stage))).sort((a, b) => {
    const stepA = getStageByKey(a).step ?? Number.MAX_SAFE_INTEGER;
    const stepB = getStageByKey(b).step ?? Number.MAX_SAFE_INTEGER;
    return stepA - stepB;
  });

  return (
    <div className="flex flex-col gap-6">
      {stageKeys.map((stageKey) => (
        <div key={stageKey} className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">{getStageByKey(stageKey).label}</span>
          <div className="flex flex-col gap-2">
            {tasks
              .filter((task) => task.stage === stageKey)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <Checkbox
                    checked={task.isCompleted}
                    disabled={task.isCompleted || completingTaskId === task.id}
                    onCheckedChange={() => onToggleTaskCompleted(task.id)}
                  />
                  <div className="flex flex-1 flex-col">
                    <span
                      className={
                        task.isCompleted
                          ? "text-sm text-muted-foreground line-through"
                          : "text-sm text-foreground"
                      }
                    >
                      {task.description}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Asignado a: {getUserName(task.assignedTo)}
                    </span>
                  </div>
                  {completingTaskId === task.id ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
