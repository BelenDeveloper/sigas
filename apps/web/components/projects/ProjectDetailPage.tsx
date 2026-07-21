"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useAtomValue } from "jotai";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useProject } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { hasModulePermission } from "@/lib/permission-helpers";
import { PROJECT_CATEGORY_LABELS } from "@/lib/project-types";

import { DetailPageSkeleton } from "../shared/DetailPageSkeleton";
import { ChangeStageDialog } from "./ChangeStageDialog";
import { DocumentsTab } from "./DocumentsTab";
import { FinanceTab } from "./FinanceTab";
import { LogisticsTab } from "./LogisticsTab";
import { ProjectStagePipeline } from "./ProjectStagePipeline";

const ADMIN_ROLE = "admin";
const PROJECTS_MODULE = "projects";
const PROJECTS_ROUTE = "/projects";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";
const PROJECT_NOT_FOUND_MESSAGE = "No se encontró el proyecto solicitado.";
const TERMINAL_STAGES = ["completed", "cancelled"];

interface ProjectDetailPageProps {
  projectId: string;
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const authUser = useAtomValue(authUserAtom);
  const isAdmin = authUser?.role === ADMIN_ROLE;
  const canViewProjects = hasModulePermission(authUser, PROJECTS_MODULE, "canView");
  const canEditProject = hasModulePermission(authUser, PROJECTS_MODULE, "canEdit");

  const {
    project,
    isLoading,
    changeStage,
    addTask,
    toggleTaskCompleted,
    addExpense,
    addDocument,
    recordPayment,
    toggleApprovalStep,
    editApprovalStepDescription,
    addChecklistItem,
    removeChecklistItem,
    reorderChecklistItems,
    getUploadUrl,
    isChangingStage,
    isAddingTask,
    completingTaskId,
    isAddingExpense,
    isRecordingPayment,
    togglingChecklistItemId,
    isAddingChecklistItem,
    removingChecklistItemId,
  } = useProject(projectId);
  const { users } = useUsers();

  const [isChangeStageOpen, setIsChangeStageOpen] = useState(false);

  if (!canViewProjects) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!project) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{PROJECT_NOT_FOUND_MESSAGE}</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={PROJECTS_ROUTE} />}
          className="w-fit"
        >
          <ArrowLeft className="size-4" />
          Volver a proyectos
        </Button>
      </div>
    );
  }

  const canChangeStage = canEditProject && !TERMINAL_STAGES.includes(project.stage);

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={PROJECTS_ROUTE} />}
        className="w-fit"
      >
        <ArrowLeft className="size-4" />
        Volver a proyectos
      </Button>

      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
        <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
        <span className="text-sm text-muted-foreground">
          {project.companyName} · {project.clientName} · {PROJECT_CATEGORY_LABELS[project.category]}
        </span>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Pipeline del proyecto</span>
          {canChangeStage ? (
            <Button variant="outline" size="sm" onClick={() => setIsChangeStageOpen(true)}>
              Cambiar etapa
            </Button>
          ) : null}
        </div>
        <ProjectStagePipeline stage={project.stage} />
      </div>

      <Tabs defaultValue="logistics">
        <TabsList>
          <TabsTrigger value="logistics">Logística</TabsTrigger>
          {isAdmin ? <TabsTrigger value="finance">Finanzas</TabsTrigger> : null}
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="logistics" className="flex flex-col gap-4">
          <LogisticsTab
            project={project}
            users={users}
            canEdit={canEditProject}
            isAddingTask={isAddingTask}
            completingTaskId={completingTaskId}
            onAddTask={addTask}
            onToggleTaskCompleted={(taskId) => {
              toggleTaskCompleted(taskId).catch(() => undefined);
            }}
          />
        </TabsContent>

        {isAdmin ? (
          <TabsContent value="finance" className="flex flex-col gap-4">
            <FinanceTab
              project={project}
              getUploadUrl={getUploadUrl}
              isAddingExpense={isAddingExpense}
              isRecordingPayment={isRecordingPayment}
              onRecordPayment={recordPayment}
              onAddExpense={addExpense}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="documents" className="flex flex-col gap-4">
          <DocumentsTab
            project={project}
            users={users}
            canEdit={canEditProject}
            getUploadUrl={getUploadUrl}
            togglingChecklistItemId={togglingChecklistItemId}
            removingChecklistItemId={removingChecklistItemId}
            isAddingChecklistItem={isAddingChecklistItem}
            onAddDocument={addDocument}
            onToggleApprovalStep={(checklistItemId, nextIsCompleted) => {
              toggleApprovalStep(checklistItemId, nextIsCompleted).catch(() => undefined);
            }}
            onEditApprovalStepDescription={(checklistItemId, description) => {
              editApprovalStepDescription(checklistItemId, description).catch(() => undefined);
            }}
            onAddChecklistItem={addChecklistItem}
            onRemoveChecklistItem={(checklistItemId) => {
              removeChecklistItem(checklistItemId).catch(() => undefined);
            }}
            onReorderChecklistItems={(orderedIds) => {
              reorderChecklistItems(orderedIds).catch(() => undefined);
            }}
          />
        </TabsContent>
      </Tabs>

      <ChangeStageDialog
        project={project}
        open={isChangeStageOpen}
        onOpenChange={setIsChangeStageOpen}
        isChangingStage={isChangingStage}
        onConfirm={changeStage}
      />
    </div>
  );
}
