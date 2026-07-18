"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { CircleDollarSign, FolderKanban, UserRoundX, Wallet } from "lucide-react";

import { useDashboard } from "@/hooks/use-dashboard";
import { formatCurrencyBOB } from "@/lib/format-currency";

import { CashDestinationCard } from "./CashDestinationCard";
import { KpiCard } from "./KpiCard";
import { LowStockList } from "./LowStockList";
import { PendingPaymentsList } from "./PendingPaymentsList";
import { PeriodFilter } from "./PeriodFilter";
import { ProjectsByCompanyList } from "./ProjectsByCompanyList";
import { SalesChart } from "./SalesChart";

export function DashboardPage() {
  const {
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
    pendingPayments,
    clientsWithDebtCount,
    activeProjectsCount,
    projectsByCompany,
    isLoading,
  } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
          <SelectTrigger className="w-64">
            <SelectValue>
              {(value: string | null) =>
                companies.find((company) => company.id === value)?.name
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <PeriodFilter
          period={period}
          customFrom={customFrom}
          customTo={customTo}
          onPeriodChange={setPeriod}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ventas del período"
          value={formatCurrencyBOB(salesTotalBOB)}
          icon={CircleDollarSign}
          trendPercent={salesTrendPercent}
        />
        <KpiCard
          label="Movimiento de caja del período"
          value={formatCurrencyBOB(cashNetBOB)}
          icon={Wallet}
          trendPercent={cashTrendPercent}
        />
        <KpiCard
          label="Clientes con deuda"
          value={String(clientsWithDebtCount)}
          icon={UserRoundX}
        />
        <KpiCard
          label="Proyectos activos"
          value={String(activeProjectsCount)}
          icon={FolderKanban}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalesChart data={monthlySales} />
        <CashDestinationCard destinations={cashDestinations} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LowStockList products={lowStockProducts} isLoading={isLoading} />
        <ProjectsByCompanyList companies={projectsByCompany} isLoading={isLoading} />
      </div>

      <PendingPaymentsList payments={pendingPayments} isLoading={isLoading} />
    </div>
  );
}
