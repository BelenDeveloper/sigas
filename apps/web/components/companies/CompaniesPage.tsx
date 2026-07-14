"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useCompanies } from "@/hooks/use-companies";
import { useUsers } from "@/hooks/use-users";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import type { Company } from "@/lib/company-types";

import { CompanyAccessEditor } from "./CompanyAccessEditor";
import { CompanyCard } from "./CompanyCard";
import { CompanyFormDialog } from "./CompanyFormDialog";

const ADMIN_ROLE = "admin";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";
const SKELETON_CARD_COUNT = 6;

export function CompaniesPage() {
  const authUser = useAtomValue(authUserAtom);
  const isAdmin = authUser?.role === ADMIN_ROLE;

  const { companies, createCompany, updateCompany, updateCompanyAccess, isLoading } = useCompanies();
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
        {isLoading
          ? Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))
          : companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
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
        onSave={updateCompanyAccess}
      />
    </div>
  );
}
