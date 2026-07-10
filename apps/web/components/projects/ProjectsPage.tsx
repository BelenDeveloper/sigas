"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useClients } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";

import { ProjectCard } from "./ProjectCard";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectFormDialog } from "./ProjectFormDialog";

const NO_PROJECTS_MESSAGE = "No se encontraron proyectos con estos filtros.";

export function ProjectsPage() {
  const { projects, companies, filters, setFilters, createProject } = useProjects();
  const { clients } = useClients();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const getClientName = (clientId: string) =>
    clients.find((client) => client.id === clientId)?.name ?? "";

  const getCompanyName = (companyId: string) =>
    companies.find((company) => company.id === companyId)?.name ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ProjectFilters filters={filters} onFiltersChange={setFilters} companies={companies} />
        <Button
          className="bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="size-4" />
          Nuevo proyecto
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-center text-muted-foreground">{NO_PROJECTS_MESSAGE}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              clientName={getClientName(project.clientId)}
              companyName={getCompanyName(project.companyId)}
            />
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
