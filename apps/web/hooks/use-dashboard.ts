"use client";

import { useMemo, useState } from "react";

import { getStageByKey } from "@/lib/constants/project-stages";
import {
  ALL_COMPANIES_OPTION_ID,
  type CashDestination,
  type CompanyProjects,
  type DashboardCompanyOption,
  type LowStockProduct,
  type MonthlySales,
} from "@/lib/dashboard-types";
import { getPeriodRange, getPreviousPeriodRange, getTrendPercent, type PeriodOption } from "@/lib/date-range";
import {
  MOCK_CLIENTS_WITH_DEBT_COUNT,
  MOCK_PENDING_PAYMENTS,
  type PendingPayment,
} from "@/lib/mocks/dashboard.mock";
import { trpc } from "@/lib/trpc/client";

const TERMINAL_PROJECT_STAGES = ["completed", "cancelled"];
const MONTHLY_CHART_MONTH_COUNT = 6;
const MONTH_LABEL_LOCALE = "es-BO";
const DEFAULT_CASH_DESTINATION_COLOR = "bg-blue-500";
const CASH_DESTINATION_COLORS = [
  DEFAULT_CASH_DESTINATION_COLOR,
  "bg-emerald-500",
  "bg-brand",
  "bg-amber-500",
  "bg-purple-500",
];

interface UseDashboardResult {
  companies: DashboardCompanyOption[];
  selectedCompanyId: string;
  setSelectedCompanyId: (companyId: string | null) => void;
  period: PeriodOption;
  customFrom: string;
  customTo: string;
  setPeriod: (period: PeriodOption) => void;
  setCustomFrom: (date: string) => void;
  setCustomTo: (date: string) => void;
  monthlySales: MonthlySales[];
  salesTotalBOB: number;
  salesTrendPercent: number;
  cashNetBOB: number;
  cashTrendPercent: number;
  cashDestinations: CashDestination[];
  lowStockProducts: LowStockProduct[];
  pendingPayments: PendingPayment[];
  clientsWithDebtCount: number;
  activeProjectsCount: number;
  projectsByCompany: CompanyProjects[];
  isLoading: boolean;
}

function sumSalesTotals(sales: { total: string; status: string }[]): number {
  return sales
    .filter((sale) => sale.status !== "cancelled")
    .reduce((sum, sale) => sum + Number(sale.total), 0);
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(MONTH_LABEL_LOCALE, { month: "short" });
}

export function useDashboard(): UseDashboardResult {
  const [selectedCompanyId, setSelectedCompanyIdState] = useState(ALL_COMPANIES_OPTION_ID);
  const [period, setPeriod] = useState<PeriodOption>("this_month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const setSelectedCompanyId = (companyId: string | null) => {
    setSelectedCompanyIdState(companyId ?? ALL_COMPANIES_OPTION_ID);
  };

  const companyId = selectedCompanyId === ALL_COMPANIES_OPTION_ID ? undefined : selectedCompanyId;
  const currentRange = getPeriodRange(period, customFrom, customTo);
  const previousRange = getPreviousPeriodRange(currentRange);

  const chartStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - (MONTHLY_CHART_MONTH_COUNT - 1), 1)
      .toISOString()
      .slice(0, 10);
  }, []);

  const { data: rawCompanies } = trpc.companies.list.useQuery();

  const { data: rawCurrentSales } = trpc.sales.list.useQuery({
    dateFrom: currentRange.dateFrom,
    dateTo: currentRange.dateTo,
    companyId,
  });

  const { data: rawPreviousSales } = trpc.sales.list.useQuery({
    dateFrom: previousRange.dateFrom,
    dateTo: previousRange.dateTo,
    companyId,
  });

  const { data: rawChartSales } = trpc.sales.list.useQuery({
    dateFrom: chartStart,
    companyId,
  });

  const { data: rawCurrentCash } = trpc.cash.getWhereIsTheMoney.useQuery({
    dateFrom: new Date(currentRange.dateFrom),
    dateTo: new Date(currentRange.dateTo),
  });

  const { data: rawPreviousCash } = trpc.cash.getWhereIsTheMoney.useQuery({
    dateFrom: new Date(previousRange.dateFrom),
    dateTo: new Date(previousRange.dateTo),
  });

  const { data: rawLowStock } = trpc.inventory.getLowStock.useQuery();

  const { data: rawProjects } = trpc.projects.list.useQuery({ companyId });

  const companies: DashboardCompanyOption[] = [
    { id: ALL_COMPANIES_OPTION_ID, name: "Todas las empresas" },
    ...(rawCompanies ?? []).map((company) => ({ id: company.id, name: company.name })),
  ];

  const salesTotalBOB = useMemo(() => sumSalesTotals(rawCurrentSales ?? []), [rawCurrentSales]);
  const previousSalesTotalBOB = useMemo(() => sumSalesTotals(rawPreviousSales ?? []), [rawPreviousSales]);
  const salesTrendPercent = getTrendPercent(salesTotalBOB, previousSalesTotalBOB);

  const monthlySales = useMemo<MonthlySales[]>(() => {
    const now = new Date();
    const months: { key: string; date: Date }[] = [];

    for (let offset = MONTHLY_CHART_MONTH_COUNT - 1; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      months.push({ key: `${date.getFullYear()}-${date.getMonth()}`, date });
    }

    const totalsByMonth = new Map<string, number>();

    for (const sale of rawChartSales ?? []) {
      if (sale.status === "cancelled") {
        continue;
      }

      const saleDate = new Date(sale.saleDate);
      const key = `${saleDate.getFullYear()}-${saleDate.getMonth()}`;
      totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + Number(sale.total));
    }

    return months.map(({ key, date }) => ({
      month: monthLabel(date),
      totalBOB: totalsByMonth.get(key) ?? 0,
    }));
  }, [rawChartSales]);

  const cashNetBOB = useMemo(
    () => (rawCurrentCash ?? []).reduce((sum, entry) => sum + entry.total, 0),
    [rawCurrentCash],
  );
  const previousCashNetBOB = useMemo(
    () => (rawPreviousCash ?? []).reduce((sum, entry) => sum + entry.total, 0),
    [rawPreviousCash],
  );
  const cashTrendPercent = getTrendPercent(cashNetBOB, previousCashNetBOB);

  const cashDestinations: CashDestination[] = (rawCurrentCash ?? []).map((entry, index) => ({
    name: entry.destination,
    amountBOB: entry.total,
    colorClassName:
      CASH_DESTINATION_COLORS[index % CASH_DESTINATION_COLORS.length] ?? DEFAULT_CASH_DESTINATION_COLOR,
  }));

  const lowStockProducts: LowStockProduct[] = (rawLowStock ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    currentStock: Number(product.currentStock),
    minimumStock: Number(product.minimumStock),
  }));

  const activeProjects = (rawProjects ?? []).filter(
    (project) => !TERMINAL_PROJECT_STAGES.includes(project.stage),
  );

  const projectsByCompany = useMemo<CompanyProjects[]>(() => {
    const grouped = new Map<string, CompanyProjects>();

    for (const project of rawProjects ?? []) {
      const key = project.companyId ?? "sin-empresa";
      const name = project.companyName ?? "Sin empresa";

      if (!grouped.has(key)) {
        grouped.set(key, { companyId: key, companyName: name, projects: [] });
      }

      grouped.get(key)?.projects.push({
        id: project.id,
        name: project.name,
        stage: getStageByKey(project.stage).label,
      });
    }

    return Array.from(grouped.values());
  }, [rawProjects]);

  const isLoading =
    rawCompanies === undefined ||
    rawCurrentSales === undefined ||
    rawCurrentCash === undefined ||
    rawLowStock === undefined ||
    rawProjects === undefined;

  return {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    period,
    customFrom,
    customTo,
    setPeriod,
    setCustomFrom,
    setCustomTo,
    monthlySales,
    salesTotalBOB,
    salesTrendPercent,
    cashNetBOB,
    cashTrendPercent,
    cashDestinations,
    lowStockProducts,
    pendingPayments: MOCK_PENDING_PAYMENTS,
    clientsWithDebtCount: MOCK_CLIENTS_WITH_DEBT_COUNT,
    activeProjectsCount: activeProjects.length,
    projectsByCompany,
    isLoading,
  };
}
