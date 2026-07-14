"use client";

import type { Company } from "@/lib/company-types";
import { trpc } from "@/lib/trpc/client";

export interface CompanyInput {
  name: string;
  description: string;
  isActive: boolean;
}

export interface UserAccessInput {
  userId: string;
  canView: boolean;
  canEdit: boolean;
}

interface UseCompaniesResult {
  companies: Company[];
  createCompany: (input: CompanyInput) => void;
  updateCompany: (companyId: string, input: CompanyInput) => void;
  updateCompanyAccess: (companyId: string, accessList: UserAccessInput[]) => Promise<void>;
  isLoading: boolean;
}

export function useCompanies(): UseCompaniesResult {
  const utils = trpc.useUtils();
  const { data } = trpc.companies.list.useQuery();

  const invalidateCompanies = () => void utils.companies.list.invalidate();

  const createMutation = trpc.companies.create.useMutation({ onSuccess: invalidateCompanies });
  const updateMutation = trpc.companies.update.useMutation({ onSuccess: invalidateCompanies });
  const updateAccessMutation = trpc.companies.updateAccess.useMutation();

  const createCompany = (input: CompanyInput) => {
    createMutation.mutate({ name: input.name, description: input.description });
  };

  const updateCompany = (companyId: string, input: CompanyInput) => {
    updateMutation.mutate({
      id: companyId,
      name: input.name,
      description: input.description,
      isActive: input.isActive,
    });
  };

  const updateCompanyAccess = async (companyId: string, accessList: UserAccessInput[]) => {
    await Promise.all(
      accessList.map((access) =>
        updateAccessMutation.mutateAsync({
          companyId,
          userId: access.userId,
          canView: access.canView,
          canEdit: access.canEdit,
        }),
      ),
    );

    await utils.companies.getAccessList.invalidate({ companyId });
  };

  return {
    companies: data ?? [],
    createCompany,
    updateCompany,
    updateCompanyAccess,
    isLoading: data === undefined,
  };
}
