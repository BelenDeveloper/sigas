"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { CircleDollarSign, FolderKanban, UserRoundX, Wallet } from "lucide-react";

import { useDashboard } from "@/hooks/use-dashboard";
import { formatCurrencyBOB } from "@/lib/format-currency";

import { CashDestinationCard } from "./CashDestinationCard";
import { KpiCard } from "./KpiCard";
import { LowStockList } from "./LowStockList";
import { PendingPaymentsList } from "./PendingPaymentsList";
import { ProjectsByCompanyList } from "./ProjectsByCompanyList";
import { SalesChart } from "./SalesChart";

export function DashboardPage() {
  const {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    monthlySales,
    kpis,
    cashDestinations,
    lowStockProducts,
    pendingPayments,
    projectsByCompany,
    isLoading,
  } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ventas del mes"
          value={formatCurrencyBOB(kpis.monthlySalesBOB)}
          icon={CircleDollarSign}
          trendPercent={kpis.monthlySalesTrendPercent}
        />
        <KpiCard
          label="Saldo en caja"
          value={formatCurrencyBOB(kpis.cashBalanceBOB)}
          icon={Wallet}
          trendPercent={kpis.cashBalanceTrendPercent}
        />
        <KpiCard
          label="Clientes con deuda"
          value={String(kpis.clientsWithDebtCount)}
          icon={UserRoundX}
        />
        <KpiCard
          label="Proyectos activos"
          value={String(kpis.activeProjectsCount)}
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
