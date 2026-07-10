"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useCompanies } from "@/hooks/use-companies";
import { useUsers } from "@/hooks/use-users";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import type { Company } from "@/lib/mocks/companies.mock";

import { CompanyAccessEditor } from "./CompanyAccessEditor";
import { CompanyCard } from "./CompanyCard";
import { CompanyFormDialog } from "./CompanyFormDialog";

const ADMIN_ROLE = "admin";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";

export function CompaniesPage() {
  const authUser = useAtomValue(authUserAtom);
  const isAdmin = authUser?.role === ADMIN_ROLE;

  const { companies, companyAccess, createCompany, updateCompany, getUserCountForCompany, updateCompanyAccess } =
    useCompanies();
  const { users } = useUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isAccessEditorOpen, setIsAccessEditorOpen] = useState(false);
  const [companyForAccess, setCompanyForAccess] = useState<Company | null>(null);

  if (!isAdmin) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  const handleNewCompany = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleManageAccess = (company: Company) => {
    setCompanyForAccess(company);
    setIsAccessEditorOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleNewCompany}>
          <Plus className="size-4" />
          Nueva empresa
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            userCount={getUserCountForCompany(company.id)}
            onEdit={handleEditCompany}
            onManageAccess={handleManageAccess}
          />
        ))}
      </div>

      <CompanyFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        company={editingCompany}
        onCreate={createCompany}
        onUpdate={updateCompany}
      />

      <CompanyAccessEditor
        open={isAccessEditorOpen}
        onOpenChange={setIsAccessEditorOpen}
        company={companyForAccess}
        users={users}
        companyAccess={companyAccess}
        onSave={updateCompanyAccess}
      />
    </div>
  );
}
