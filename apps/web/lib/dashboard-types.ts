export const ALL_COMPANIES_OPTION_ID = "all";

export interface DashboardCompanyOption {
  id: string;
  name: string;
}

export interface MonthlySales {
  month: string;
  totalBOB: number;
}

export interface CashDestination {
  name: string;
  amountBOB: number;
  colorClassName: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
}

export interface Project {
  id: string;
  name: string;
  stage: string;
}

export interface CompanyProjects {
  companyId: string;
  companyName: string;
  projects: Project[];
}
