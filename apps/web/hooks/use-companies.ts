"use client";

import { useState } from "react";

import {
  MOCK_COMPANIES,
  MOCK_COMPANY_ACCESS,
  type Company,
  type CompanyAccess,
} from "@/lib/mocks/companies.mock";

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
  companyAccess: CompanyAccess[];
  createCompany: (input: CompanyInput) => void;
  updateCompany: (companyId: string, input: CompanyInput) => void;
  getUserCountForCompany: (companyId: string) => number;
  updateCompanyAccess: (companyId: string, accessList: UserAccessInput[]) => void;
}

export function useCompanies(): UseCompaniesResult {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [companyAccess, setCompanyAccess] = useState<CompanyAccess[]>(MOCK_COMPANY_ACCESS);

  const createCompany = (input: CompanyInput) => {
    const newCompany: Company = { ...input, id: crypto.randomUUID() };

    setCompanies((previous) => [...previous, newCompany]);
  };

  const updateCompany = (companyId: string, input: CompanyInput) => {
    setCompanies((previous) =>
      previous.map((company) => (company.id === companyId ? { ...company, ...input } : company)),
    );
  };

  const getUserCountForCompany = (companyId: string) =>
    companyAccess.filter((access) => access.companyId === companyId && access.canView).length;

  const updateCompanyAccess = (companyId: string, accessList: UserAccessInput[]) => {
    const updatedRows: CompanyAccess[] = accessList.map((access) => ({ companyId, ...access }));

    setCompanyAccess((previous) => [
      ...previous.filter((access) => access.companyId !== companyId),
      ...updatedRows,
    ]);
  };

  return {
    companies,
    companyAccess,
    createCompany,
    updateCompany,
    getUserCountForCompany,
    updateCompanyAccess,
  };
}
