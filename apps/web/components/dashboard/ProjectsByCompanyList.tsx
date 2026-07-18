import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

import { ListSkeleton } from "@/components/shared/ListSkeleton";
import type { CompanyProjects } from "@/lib/dashboard-types";

const SKELETON_ITEMS = 3;
const SKELETON_ITEM_CLASS_NAME = "h-10 w-full";

interface ProjectsByCompanyListProps {
  companies: CompanyProjects[];
  isLoading: boolean;
}

export function ProjectsByCompanyList({ companies, isLoading }: ProjectsByCompanyListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos por empresa</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <ListSkeleton items={SKELETON_ITEMS} itemClassName={SKELETON_ITEM_CLASS_NAME} />
        ) : (
          companies.map((company) => (
            <div key={company.companyId} className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">{company.companyName}</span>
              {company.projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-4 pl-2">
                  <span className="text-sm text-muted-foreground">{project.name}</span>
                  <Badge variant="secondary">{project.stage}</Badge>
                </div>
              ))}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
