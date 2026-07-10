export interface Company {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CompanyAccess {
  companyId: string;
  userId: string;
  canView: boolean;
  canEdit: boolean;
}

export const MOCK_COMPANIES: Company[] = [
  {
    id: "cochabamba",
    name: "SIGAS Cochabamba",
    description: "Casa matriz y centro de operaciones principal.",
    isActive: true,
  },
  {
    id: "oruro",
    name: "SIGAS Oruro",
    description: "Sucursal encargada de instalaciones en Oruro y alrededores.",
    isActive: true,
  },
  {
    id: "santa-cruz",
    name: "SIGAS Santa Cruz",
    description: "Sucursal para proyectos comerciales e industriales en Santa Cruz.",
    isActive: true,
  },
];

export const MOCK_COMPANY_ACCESS: CompanyAccess[] = [
  { companyId: "cochabamba", userId: "1", canView: true, canEdit: true },
  { companyId: "cochabamba", userId: "2", canView: true, canEdit: false },
  { companyId: "cochabamba", userId: "3", canView: true, canEdit: false },
  { companyId: "cochabamba", userId: "4", canView: true, canEdit: false },
  { companyId: "oruro", userId: "1", canView: true, canEdit: true },
  { companyId: "santa-cruz", userId: "1", canView: true, canEdit: true },
];
