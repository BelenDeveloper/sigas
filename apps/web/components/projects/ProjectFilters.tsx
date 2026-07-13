"use client";

import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

import {
  ALL_CATEGORIES_OPTION,
  ALL_COMPANIES_OPTION,
  ALL_STAGES_OPTION,
  type ProjectFilterState,
} from "@/hooks/use-projects";
import { getStageByKey, PROJECT_STAGES } from "@/lib/constants/project-stages";
import type { Company } from "@/lib/company-types";
import { PROJECT_CATEGORIES, PROJECT_CATEGORY_LABELS } from "@/lib/project-types";

const ALL_COMPANIES_LABEL = "Todas las empresas";
const ALL_CATEGORIES_LABEL = "Todas las categorías";
const ALL_STAGES_LABEL = "Todas las etapas";

interface ProjectFiltersProps {
  filters: ProjectFilterState;
  onFiltersChange: (filters: Partial<ProjectFilterState>) => void;
  companies: Company[];
}

export function ProjectFilters({ filters, onFiltersChange, companies }: ProjectFiltersProps) {
  const selectedCompany = companies.find((company) => company.id === filters.companyId);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="project-filter-company">Empresa</Label>
        <Select
          value={filters.companyId}
          onValueChange={(companyId) =>
            onFiltersChange({ companyId: companyId ?? ALL_COMPANIES_OPTION })
          }
        >
          <SelectTrigger id="project-filter-company" className="w-52">
            <SelectValue>{() => selectedCompany?.name ?? ALL_COMPANIES_LABEL}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_COMPANIES_OPTION}>{ALL_COMPANIES_LABEL}</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="project-filter-category">Categoría</Label>
        <Select
          value={filters.category}
          onValueChange={(category) =>
            onFiltersChange({
              category: (category ?? ALL_CATEGORIES_OPTION) as ProjectFilterState["category"],
            })
          }
        >
          <SelectTrigger id="project-filter-category" className="w-48">
            <SelectValue>
              {() =>
                filters.category === ALL_CATEGORIES_OPTION
                  ? ALL_CATEGORIES_LABEL
                  : PROJECT_CATEGORY_LABELS[filters.category]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_OPTION}>{ALL_CATEGORIES_LABEL}</SelectItem>
            {PROJECT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {PROJECT_CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="project-filter-stage">Etapa</Label>
        <Select
          value={filters.stage}
          onValueChange={(stage) =>
            onFiltersChange({ stage: (stage ?? ALL_STAGES_OPTION) as ProjectFilterState["stage"] })
          }
        >
          <SelectTrigger id="project-filter-stage" className="w-56">
            <SelectValue>
              {() =>
                filters.stage === ALL_STAGES_OPTION ? ALL_STAGES_LABEL : getStageByKey(filters.stage).label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STAGES_OPTION}>{ALL_STAGES_LABEL}</SelectItem>
            {PROJECT_STAGES.map((stage) => (
              <SelectItem key={stage.key} value={stage.key}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
