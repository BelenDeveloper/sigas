"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { useEffect, useState } from "react";

import type { UserAccessInput } from "@/hooks/use-companies";
import type { Company, CompanyAccess } from "@/lib/mocks/companies.mock";
import type { AdminUser } from "@/lib/mocks/users-admin.mock";

function buildAccessDraft(
  users: AdminUser[],
  companyAccess: CompanyAccess[],
  companyId: string,
): UserAccessInput[] {
  return users.map((user) => {
    const existingAccess = companyAccess.find(
      (access) => access.companyId === companyId && access.userId === user.id,
    );

    return {
      userId: user.id,
      canView: existingAccess?.canView ?? false,
      canEdit: existingAccess?.canEdit ?? false,
    };
  });
}

interface CompanyAccessEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  users: AdminUser[];
  companyAccess: CompanyAccess[];
  onSave: (companyId: string, accessList: UserAccessInput[]) => void;
}

export function CompanyAccessEditor({
  open,
  onOpenChange,
  company,
  users,
  companyAccess,
  onSave,
}: CompanyAccessEditorProps) {
  const [accessDraft, setAccessDraft] = useState<UserAccessInput[]>([]);

  useEffect(() => {
    if (open && company) {
      setAccessDraft(buildAccessDraft(users, companyAccess, company.id));
    }
  }, [open, company, users, companyAccess]);

  if (!company) {
    return null;
  }

  const handleCanViewChange = (userId: string, canView: boolean) => {
    setAccessDraft((previous) =>
      previous.map((access) =>
        access.userId === userId
          ? { ...access, canView, canEdit: canView && access.canEdit }
          : access,
      ),
    );
  };

  const handleCanEditChange = (userId: string, canEdit: boolean) => {
    setAccessDraft((previous) =>
      previous.map((access) => (access.userId === userId ? { ...access, canEdit } : access)),
    );
  };

  const handleSave = () => {
    onSave(company.id, accessDraft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gestionar acceso</DialogTitle>
          <DialogDescription>{company.name}</DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Puede ver</TableHead>
              <TableHead>Puede editar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const access = accessDraft.find((candidate) => candidate.userId === user.id);

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={access?.canView ?? false}
                      onCheckedChange={(checked) => handleCanViewChange(user.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={access?.canEdit ?? false}
                      disabled={!access?.canView}
                      onCheckedChange={(checked) => handleCanEditChange(user.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <DialogFooter>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
