export interface MonthlySales {
  month: string;
  totalBOB: number;
}

export const MOCK_MONTHLY_SALES: MonthlySales[] = [
  { month: "Jun", totalBOB: 68000 },
  { month: "Jul", totalBOB: 72000 },
  { month: "Ago", totalBOB: 79500 },
  { month: "Sep", totalBOB: 76000 },
  { month: "Oct", totalBOB: 81000 },
  { month: "Nov", totalBOB: 85000 },
];

export interface DashboardKpis {
  monthlySalesBOB: number;
  monthlySalesTrendPercent: number;
  cashBalanceBOB: number;
  cashBalanceTrendPercent: number;
  clientsWithDebtCount: number;
  activeProjectsCount: number;
}

export const MOCK_DASHBOARD_KPIS: DashboardKpis = {
  monthlySalesBOB: 85000,
  monthlySalesTrendPercent: 8,
  cashBalanceBOB: 42000,
  cashBalanceTrendPercent: 5,
  clientsWithDebtCount: 3,
  activeProjectsCount: 5,
};

export interface CashDestination {
  name: string;
  amountBOB: number;
  colorClassName: string;
}

export const MOCK_CASH_DESTINATIONS: CashDestination[] = [
  { name: "QR", amountBOB: 18000, colorClassName: "bg-blue-500" },
  { name: "Transferencia bancaria", amountBOB: 14000, colorClassName: "bg-emerald-500" },
  { name: "Efectivo", amountBOB: 10000, colorClassName: "bg-brand" },
];

export interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
}

export const MOCK_LOW_STOCK_PRODUCTS: LowStockProduct[] = [
  { id: "1", name: "Garrafa de gas 10kg", currentStock: 4, minimumStock: 15 },
  { id: "2", name: "Regulador de presión", currentStock: 2, minimumStock: 10 },
  { id: "3", name: "Manguera de gas 1.5m", currentStock: 6, minimumStock: 20 },
  { id: "4", name: "Válvula de seguridad", currentStock: 3, minimumStock: 12 },
  { id: "5", name: "Detector de fugas", currentStock: 1, minimumStock: 8 },
];

export type ProjectStage = "Cotización" | "En instalación" | "Pendiente de pago" | "Finalizado";

export interface Project {
  id: string;
  name: string;
  stage: ProjectStage;
}

export interface CompanyProjects {
  companyId: string;
  companyName: string;
  projects: Project[];
}

export const MOCK_PROJECTS_BY_COMPANY: CompanyProjects[] = [
  {
    companyId: "la-paz",
    companyName: "SIGAS La Paz",
    projects: [
      { id: "p1", name: "Instalación de red - Ed. Torres del Sol", stage: "En instalación" },
      { id: "p2", name: "Mantenimiento de planta - Hotel Real", stage: "Pendiente de pago" },
    ],
  },
  {
    companyId: "santa-cruz",
    companyName: "SIGAS Santa Cruz",
    projects: [
      { id: "p3", name: "Instalación domiciliaria - Urb. Las Palmas", stage: "Cotización" },
      { id: "p4", name: "Ampliación de red - Zona Norte", stage: "En instalación" },
      { id: "p5", name: "Instalación industrial - Frigorífico San José", stage: "Finalizado" },
    ],
  },
  {
    companyId: "cochabamba",
    companyName: "SIGAS Cochabamba",
    projects: [
      { id: "p6", name: "Instalación de red - Cond. Los Sauces", stage: "En instalación" },
    ],
  },
];

export interface Company {
  id: string;
  name: string;
}

export const ALL_COMPANIES_OPTION_ID = "all";

export const MOCK_COMPANIES: Company[] = [
  { id: ALL_COMPANIES_OPTION_ID, name: "Todas las empresas" },
  { id: "la-paz", name: "SIGAS La Paz" },
  { id: "santa-cruz", name: "SIGAS Santa Cruz" },
  { id: "cochabamba", name: "SIGAS Cochabamba" },
];

export interface PendingPayment {
  id: string;
  clientName: string;
  amountBOB: number;
  dueDate: string;
}

export const MOCK_PENDING_PAYMENTS: PendingPayment[] = [
  { id: "pp1", clientName: "Constructora Andina S.R.L.", amountBOB: 12500, dueDate: "2026-07-15" },
  { id: "pp2", clientName: "Hotel Real Cochabamba", amountBOB: 8200, dueDate: "2026-07-20" },
  { id: "pp3", clientName: "Frigorífico San José", amountBOB: 5400, dueDate: "2026-07-28" },
];
