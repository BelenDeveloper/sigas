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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { UserAccessInput } from "@/hooks/use-companies";
import type { Company, CompanyAccessEntry } from "@/lib/company-types";
import { trpc } from "@/lib/trpc/client";
import type { AdminUser } from "@/lib/user-permissions";

const SAVE_ERROR_MESSAGE = "No se pudo guardar el acceso. Intenta nuevamente.";

function buildAccessDraft(users: AdminUser[], accessEntries: CompanyAccessEntry[]): UserAccessInput[] {
  return users.map((user) => {
    const existingAccess = accessEntries.find((access) => access.userId === user.id);

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
  isSaving: boolean;
  onSave: (companyId: string, accessList: UserAccessInput[]) => Promise<void>;
}

export function CompanyAccessEditor({
  open,
  onOpenChange,
  company,
  users,
  isSaving,
  onSave,
}: CompanyAccessEditorProps) {
  const [accessDraft, setAccessDraft] = useState<UserAccessInput[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: accessEntries } = trpc.companies.getAccessList.useQuery(
    { companyId: company?.id ?? "" },
    { enabled: open && company !== null },
  );

  useEffect(() => {
    if (open && company) {
      setAccessDraft(buildAccessDraft(users, accessEntries ?? []));
      setErrorMessage(null);
    }
  }, [open, company, users, accessEntries]);

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

  const handleSave = async () => {
    setErrorMessage(null);

    try {
      await onSave(company.id, accessDraft);
      onOpenChange(false);
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
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

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        <DialogFooter>
          <Button
            disabled={isSaving}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => void handleSave()}
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
