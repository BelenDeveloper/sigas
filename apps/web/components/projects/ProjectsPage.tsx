"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useClients } from "@/hooks/use-clients";
import { useCompanies } from "@/hooks/use-companies";
import { useProjects } from "@/hooks/use-projects";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { hasModulePermission } from "@/lib/permission-helpers";

import { ProjectCard } from "./ProjectCard";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectFormDialog } from "./ProjectFormDialog";

const PROJECTS_MODULE = "projects";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";
const NO_PROJECTS_MESSAGE = "No se encontraron proyectos con estos filtros.";

export function ProjectsPage() {
  const authUser = useAtomValue(authUserAtom);
  const canViewProjects = hasModulePermission(authUser, PROJECTS_MODULE, "canView");
  const canCreateProject = hasModulePermission(authUser, PROJECTS_MODULE, "canCreate");

  const { projects, filters, setFilters, createProject } = useProjects();
  const { companies } = useCompanies();
  const { clients } = useClients();

  const [isFormOpen, setIsFormOpen] = useState(false);

  if (!canViewProjects) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ProjectFilters filters={filters} onFiltersChange={setFilters} companies={companies} />
        {canCreateProject ? (
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="size-4" />
            Nuevo proyecto
          </Button>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <p className="text-center text-muted-foreground">{NO_PROJECTS_MESSAGE}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        companies={companies}
        clients={clients}
        onCreate={createProject}
      />
    </div>
  );
}
