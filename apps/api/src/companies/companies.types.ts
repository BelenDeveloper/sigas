import type { Company } from "@repo/db";

export type { Company };

export interface CreateCompanyInput {
  name: string;
  description?: string;
}

export interface UpdateCompanyInput {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CompanyAccessInput {
  canView: boolean;
  canEdit: boolean;
}

export interface CompanyAccessEntry {
  userId: string;
  canView: boolean;
  canEdit: boolean;
}

export class CompanyNotFoundError extends Error {
  constructor(companyId: string) {
    super(`Company not found: ${companyId}`);
    this.name = "CompanyNotFoundError";
  }
}

export class CompanyAccessDeniedError extends Error {
  constructor(companyId: string) {
    super(`Access denied to company: ${companyId}`);
    this.name = "CompanyAccessDeniedError";
  }
}
