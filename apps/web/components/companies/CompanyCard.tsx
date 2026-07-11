import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Pencil, Users } from "lucide-react";

import type { Company } from "@/lib/company-types";
import { trpc } from "@/lib/trpc/client";

const ACTIVE_LABEL = "Activa";
const INACTIVE_LABEL = "Inactiva";
const ACTIVE_BADGE_CLASSES = "bg-emerald-100 text-emerald-800";

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onManageAccess: (company: Company) => void;
}

export function CompanyCard({ company, onEdit, onManageAccess }: CompanyCardProps) {
  const { data: accessList } = trpc.companies.getAccessList.useQuery({ companyId: company.id });
  const userCount = accessList?.filter((access) => access.canView).length ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle>{company.name}</CardTitle>
        <Badge
          variant={company.isActive ? undefined : "secondary"}
          className={company.isActive ? ACTIVE_BADGE_CLASSES : undefined}
        >
          {company.isActive ? ACTIVE_LABEL : INACTIVE_LABEL}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{company.description}</p>
        <span className="text-sm text-muted-foreground">
          {userCount} {userCount === 1 ? "usuario con acceso" : "usuarios con acceso"}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(company)}>
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onManageAccess(company)}>
            <Users className="size-4" />
            Gestionar acceso
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
