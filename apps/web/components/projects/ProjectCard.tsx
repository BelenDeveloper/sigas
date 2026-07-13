"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { useRouter } from "next/navigation";

import type { ProjectListItem } from "@/hooks/use-projects";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PROJECT_CATEGORY_LABELS } from "@/lib/project-types";

import { ProjectStageBadge } from "./ProjectStageBadge";

interface ProjectCardProps {
  project: ProjectListItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardHeader className="flex flex-col gap-1">
        <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
        <span className="font-semibold text-foreground">{project.name}</span>
        <span className="text-sm text-muted-foreground">{project.clientName}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{project.companyName}</Badge>
          <Badge variant="secondary">{PROJECT_CATEGORY_LABELS[project.category]}</Badge>
          <ProjectStageBadge stage={project.stage} />
        </div>
        <span className="text-lg font-semibold text-foreground">
          {formatCurrencyBOB(project.totalValueBOB)}
        </span>
      </CardContent>
    </Card>
  );
}
