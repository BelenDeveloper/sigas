"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useAtomValue } from "jotai";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useClients } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { PROJECT_CATEGORY_LABELS } from "@/lib/mocks/projects.mock";

import { ChangeStageDialog } from "./ChangeStageDialog";
import { DocumentsTab } from "./DocumentsTab";
import { FinanceTab } from "./FinanceTab";
import { LogisticsTab } from "./LogisticsTab";
import { ProjectStagePipeline } from "./ProjectStagePipeline";

const ADMIN_ROLE = "admin";
const PROJECTS_ROUTE = "/projects";
const PROJECT_NOT_FOUND_MESSAGE = "No se encontró el proyecto solicitado.";
const TERMINAL_STAGES = ["completed", "cancelled"];

interface ProjectDetailPageProps {
  projectId: string;
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const authUser = useAtomValue(authUserAtom);
  const isAdmin = authUser?.role === ADMIN_ROLE;

  const {
    getProjectById,
    companies,
    changeStage,
    addTask,
    toggleTaskCompleted,
    addExpense,
    addDocument,
    recordPayment,
    toggleApprovalStep,
  } = useProjects();
  const { clients } = useClients();

  const [isChangeStageOpen, setIsChangeStageOpen] = useState(false);

  const project = getProjectById(projectId);

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

  const client = clients.find((candidate) => candidate.id === project.clientId);
  const company = companies.find((candidate) => candidate.id === project.companyId);
  const canChangeStage = !TERMINAL_STAGES.includes(project.stage);

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
          {company?.name} · {client?.name} · {PROJECT_CATEGORY_LABELS[project.category]}
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
            onAddTask={(input) => addTask(project.id, input)}
            onToggleTaskCompleted={(taskId) => toggleTaskCompleted(project.id, taskId)}
          />
        </TabsContent>

        {isAdmin ? (
          <TabsContent value="finance" className="flex flex-col gap-4">
            <FinanceTab
              project={project}
              onRecordPayment={(installment, input) => recordPayment(project.id, installment, input)}
              onAddExpense={(input) => addExpense(project.id, input)}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="documents" className="flex flex-col gap-4">
          <DocumentsTab
            project={project}
            onAddDocument={(input) => addDocument(project.id, input)}
            onToggleApprovalStep={(stepKey) => toggleApprovalStep(project.id, stepKey)}
          />
        </TabsContent>
      </Tabs>

      <ChangeStageDialog
        project={project}
        open={isChangeStageOpen}
        onOpenChange={setIsChangeStageOpen}
        onConfirm={(nextStage, note) => changeStage(project.id, nextStage, note)}
      />
    </div>
  );
}
