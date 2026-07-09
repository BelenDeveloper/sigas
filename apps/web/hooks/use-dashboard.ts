"use client";

import { useState } from "react";

import {
  ALL_COMPANIES_OPTION_ID,
  MOCK_CASH_DESTINATIONS,
  MOCK_COMPANIES,
  MOCK_DASHBOARD_KPIS,
  MOCK_LOW_STOCK_PRODUCTS,
  MOCK_MONTHLY_SALES,
  MOCK_PENDING_PAYMENTS,
  MOCK_PROJECTS_BY_COMPANY,
  type CashDestination,
  type Company,
  type CompanyProjects,
  type DashboardKpis,
  type LowStockProduct,
  type MonthlySales,
  type PendingPayment,
} from "@/lib/mocks/dashboard.mock";

interface UseDashboardResult {
  companies: Company[];
  selectedCompanyId: string;
  setSelectedCompanyId: (companyId: string | null) => void;
  monthlySales: MonthlySales[];
  kpis: DashboardKpis;
  cashDestinations: CashDestination[];
  lowStockProducts: LowStockProduct[];
  pendingPayments: PendingPayment[];
  projectsByCompany: CompanyProjects[];
}

export function useDashboard(): UseDashboardResult {
  const [selectedCompanyId, setSelectedCompanyIdState] = useState(ALL_COMPANIES_OPTION_ID);

  const setSelectedCompanyId = (companyId: string | null) => {
    setSelectedCompanyIdState(companyId ?? ALL_COMPANIES_OPTION_ID);
  };

  const projectsByCompany =
    selectedCompanyId === ALL_COMPANIES_OPTION_ID
      ? MOCK_PROJECTS_BY_COMPANY
      : MOCK_PROJECTS_BY_COMPANY.filter((company) => company.companyId === selectedCompanyId);

  return {
    companies: MOCK_COMPANIES,
    selectedCompanyId,
    setSelectedCompanyId,
    monthlySales: MOCK_MONTHLY_SALES,
    kpis: MOCK_DASHBOARD_KPIS,
    cashDestinations: MOCK_CASH_DESTINATIONS,
    lowStockProducts: MOCK_LOW_STOCK_PRODUCTS,
    pendingPayments: MOCK_PENDING_PAYMENTS,
    projectsByCompany,
  };
}
