import { APPROVAL_CHECKLIST_STEPS, type ProjectStageKey } from "@/lib/constants/project-stages";
import type { PaymentMethod } from "@/lib/payment-method";

export type ProjectCategory = "domestic" | "commercial" | "industrial";

export const PROJECT_CATEGORIES: ProjectCategory[] = ["domestic", "commercial", "industrial"];

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  domestic: "Domiciliario",
  commercial: "Comercial",
  industrial: "Industrial",
};

export interface ProjectCompany {
  id: string;
  name: string;
}

export const MOCK_PROJECT_COMPANIES: ProjectCompany[] = [
  { id: "principal", name: "SIGAS Principal" },
  { id: "oruro", name: "SIGAS Oruro" },
  { id: "santa-cruz", name: "SIGAS Santa Cruz" },
];

export interface ProjectStageChange {
  id: string;
  stage: ProjectStageKey;
  changedAt: string;
  note: string;
}

export interface ProjectTask {
  id: string;
  stage: ProjectStageKey;
  description: string;
  assignedTo: string;
  isCompleted: boolean;
}

export interface RecordedPayment {
  amountBOB: number;
  date: string;
  method: PaymentMethod;
}

export interface ProjectExpense {
  id: string;
  stage: ProjectStageKey;
  description: string;
  amountBOB: number;
  method: PaymentMethod;
  receiptUrl: string;
  date: string;
}

export interface ProjectDocument {
  id: string;
  stage: ProjectStageKey;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ProjectApprovalStep {
  key: string;
  isCompleted: boolean;
}

export function buildDefaultApprovalChecklist(completedKeys: string[] = []): ProjectApprovalStep[] {
  return APPROVAL_CHECKLIST_STEPS.map((step) => ({
    key: step.key,
    isCompleted: completedKeys.includes(step.key),
  }));
}

export interface Project {
  id: string;
  code: string;
  name: string;
  category: ProjectCategory;
  companyId: string;
  clientId: string;
  isPrivate: boolean;
  totalValueBOB: number;
  firstPaymentAmountBOB: number;
  secondPaymentAmountBOB: number;
  firstPaymentReceived: RecordedPayment | null;
  secondPaymentReceived: RecordedPayment | null;
  startDate: string;
  description: string;
  stage: ProjectStageKey;
  stageHistory: ProjectStageChange[];
  tasks: ProjectTask[];
  expenses: ProjectExpense[];
  documents: ProjectDocument[];
  approvalChecklist: ProjectApprovalStep[];
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    code: "PRY-0001",
    name: "Instalación domiciliaria - Queru Queru",
    category: "domestic",
    companyId: "principal",
    clientId: "1",
    isPrivate: false,
    totalValueBOB: 4200,
    firstPaymentAmountBOB: 2100,
    secondPaymentAmountBOB: 2100,
    firstPaymentReceived: null,
    secondPaymentReceived: null,
    startDate: "2026-06-20",
    description: "Instalación de red de gas domiciliaria para vivienda unifamiliar.",
    stage: "quotation",
    stageHistory: [
      { id: "sh1", stage: "quotation", changedAt: "2026-06-20T09:00:00", note: "Proyecto creado." },
    ],
    tasks: [
      { id: "t1", stage: "quotation", description: "Visitar el domicilio para levantamiento", assignedTo: "3", isCompleted: true },
      { id: "t2", stage: "quotation", description: "Preparar cotización formal", assignedTo: "3", isCompleted: false },
    ],
    expenses: [
      { id: "e1", stage: "quotation", description: "Movilidad para visita técnica", amountBOB: 40, method: "cash", receiptUrl: "recibo-movilidad-001.jpg", date: "2026-06-20" },
    ],
    documents: [
      { id: "d1", stage: "quotation", fileName: "levantamiento-queru-queru.pdf", uploadedBy: "3", uploadedAt: "2026-06-20T11:30:00" },
    ],
    approvalChecklist: buildDefaultApprovalChecklist(),
  },
  {
    id: "2",
    code: "PRY-0002",
    name: "Red de gas - Edificio Torres del Sol",
    category: "commercial",
    companyId: "oruro",
    clientId: "5",
    isPrivate: false,
    totalValueBOB: 18500,
    firstPaymentAmountBOB: 9250,
    secondPaymentAmountBOB: 9250,
    firstPaymentReceived: { amountBOB: 9250, date: "2026-06-05", method: "bank_transfer" },
    secondPaymentReceived: null,
    startDate: "2026-05-25",
    description: "Instalación de red de gas para edificio comercial de 6 plantas.",
    stage: "design_inspection",
    stageHistory: [
      { id: "sh2", stage: "quotation", changedAt: "2026-05-25T09:00:00", note: "Proyecto creado." },
      { id: "sh3", stage: "contract", changedAt: "2026-05-28T10:00:00", note: "Contrato firmado por el administrador del edificio." },
      { id: "sh4", stage: "design", changedAt: "2026-06-02T09:30:00", note: "" },
      { id: "sh5", stage: "design_inspection", changedAt: "2026-06-10T15:00:00", note: "Diseño enviado a revisión regulatoria." },
    ],
    tasks: [
      { id: "t3", stage: "design", description: "Elaborar plano de red interna", assignedTo: "2", isCompleted: true },
      { id: "t4", stage: "design_inspection", description: "Preparar carpeta para YPFB", assignedTo: "2", isCompleted: true },
      { id: "t5", stage: "design_inspection", description: "Coordinar inspección municipal", assignedTo: "2", isCompleted: false },
    ],
    expenses: [
      { id: "e2", stage: "design", description: "Impresión de planos", amountBOB: 150, method: "cash", receiptUrl: "recibo-planos-002.jpg", date: "2026-06-02" },
    ],
    documents: [
      { id: "d2", stage: "design", fileName: "plano-red-interna.dwg", uploadedBy: "2", uploadedAt: "2026-06-02T16:00:00" },
      { id: "d3", stage: "design_inspection", fileName: "kmz-ypfb.kmz", uploadedBy: "2", uploadedAt: "2026-06-10T14:00:00" },
    ],
    approvalChecklist: buildDefaultApprovalChecklist(["submit_kmz", "design_approval"]),
  },
  {
    id: "3",
    code: "PRY-0003",
    name: "Red de gas industrial - Frigorífico San José",
    category: "industrial",
    companyId: "santa-cruz",
    clientId: "8",
    isPrivate: false,
    totalValueBOB: 52000,
    firstPaymentAmountBOB: 26000,
    secondPaymentAmountBOB: 26000,
    firstPaymentReceived: { amountBOB: 26000, date: "2026-05-15", method: "bank_transfer" },
    secondPaymentReceived: null,
    startDate: "2026-05-01",
    description: "Instalación de red de gas industrial para planta frigorífica.",
    stage: "installation",
    stageHistory: [
      { id: "sh6", stage: "quotation", changedAt: "2026-05-01T09:00:00", note: "Proyecto creado." },
      { id: "sh7", stage: "contract", changedAt: "2026-05-04T10:00:00", note: "" },
      { id: "sh8", stage: "design", changedAt: "2026-05-08T09:00:00", note: "" },
      { id: "sh9", stage: "design_inspection", changedAt: "2026-05-14T11:00:00", note: "Aprobado sin observaciones." },
      { id: "sh10", stage: "first_payment", changedAt: "2026-05-15T09:00:00", note: "" },
      { id: "sh11", stage: "material_purchase", changedAt: "2026-05-18T09:00:00", note: "" },
      { id: "sh12", stage: "installation", changedAt: "2026-05-25T08:00:00", note: "Cuadrilla iniciando instalación en planta." },
    ],
    tasks: [
      { id: "t6", stage: "material_purchase", description: "Comprar tuberías de acero industrial", assignedTo: "2", isCompleted: true },
      { id: "t7", stage: "installation", description: "Instalar red principal en sala de máquinas", assignedTo: "2", isCompleted: true },
      { id: "t8", stage: "installation", description: "Instalar reguladores industriales", assignedTo: "2", isCompleted: false },
      { id: "t9", stage: "installation", description: "Coordinar corte de producción con planta", assignedTo: "1", isCompleted: false },
    ],
    expenses: [
      { id: "e3", stage: "material_purchase", description: "Tuberías de acero industrial", amountBOB: 12500, method: "bank_transfer", receiptUrl: "recibo-tuberias-003.jpg", date: "2026-05-18" },
      { id: "e4", stage: "installation", description: "Pago a cuadrilla - primera semana", amountBOB: 3200, method: "cash", receiptUrl: "recibo-cuadrilla-003.jpg", date: "2026-05-30" },
    ],
    documents: [
      { id: "d4", stage: "design_inspection", fileName: "aprobacion-ypfb-frigorifico.pdf", uploadedBy: "1", uploadedAt: "2026-05-14T12:00:00" },
      { id: "d5", stage: "installation", fileName: "fotos-avance-instalacion.zip", uploadedBy: "2", uploadedAt: "2026-05-30T17:00:00" },
    ],
    approvalChecklist: buildDefaultApprovalChecklist([
      "submit_kmz",
      "design_approval",
      "sign_start_letter",
      "municipal_inspection",
      "final_stamp",
    ]),
  },
  {
    id: "4",
    code: "PRY-0004",
    name: "Instalación domiciliaria - Cala Cala",
    category: "domestic",
    companyId: "principal",
    clientId: "3",
    isPrivate: false,
    totalValueBOB: 3800,
    firstPaymentAmountBOB: 1900,
    secondPaymentAmountBOB: 1900,
    firstPaymentReceived: { amountBOB: 1900, date: "2026-04-10", method: "qr" },
    secondPaymentReceived: { amountBOB: 1900, date: "2026-04-28", method: "cash" },
    startDate: "2026-04-01",
    description: "Instalación de red de gas domiciliaria para vivienda unifamiliar.",
    stage: "completed",
    stageHistory: [
      { id: "sh13", stage: "quotation", changedAt: "2026-04-01T09:00:00", note: "Proyecto creado." },
      { id: "sh14", stage: "contract", changedAt: "2026-04-03T10:00:00", note: "" },
      { id: "sh15", stage: "design", changedAt: "2026-04-05T09:00:00", note: "" },
      { id: "sh16", stage: "design_inspection", changedAt: "2026-04-08T09:00:00", note: "" },
      { id: "sh17", stage: "first_payment", changedAt: "2026-04-10T09:00:00", note: "" },
      { id: "sh18", stage: "material_purchase", changedAt: "2026-04-12T09:00:00", note: "" },
      { id: "sh19", stage: "installation", changedAt: "2026-04-15T08:00:00", note: "" },
      { id: "sh20", stage: "technician_payment", changedAt: "2026-04-20T09:00:00", note: "" },
      { id: "sh21", stage: "hermeticity", changedAt: "2026-04-22T09:00:00", note: "" },
      { id: "sh22", stage: "final_hermeticity", changedAt: "2026-04-24T09:00:00", note: "" },
      { id: "sh23", stage: "acometida", changedAt: "2026-04-26T09:00:00", note: "" },
      { id: "sh24", stage: "completed", changedAt: "2026-04-28T16:00:00", note: "Proyecto entregado al cliente." },
    ],
    tasks: [
      { id: "t10", stage: "installation", description: "Instalar tubería interna de cocina", assignedTo: "2", isCompleted: true },
      { id: "t11", stage: "acometida", description: "Conectar acometida con la red pública", assignedTo: "2", isCompleted: true },
    ],
    expenses: [
      { id: "e5", stage: "installation", description: "Materiales de instalación interna", amountBOB: 680, method: "cash", receiptUrl: "recibo-materiales-004.jpg", date: "2026-04-15" },
    ],
    documents: [
      { id: "d6", stage: "completed", fileName: "acta-entrega-cala-cala.pdf", uploadedBy: "1", uploadedAt: "2026-04-28T16:30:00" },
    ],
    approvalChecklist: buildDefaultApprovalChecklist([
      "submit_kmz",
      "design_approval",
      "sign_start_letter",
      "municipal_inspection",
      "final_stamp",
    ]),
  },
  {
    id: "5",
    code: "PRY-0005",
    name: "Instalación domiciliaria - Tupuraya",
    category: "domestic",
    companyId: "oruro",
    clientId: "6",
    isPrivate: false,
    totalValueBOB: 3600,
    firstPaymentAmountBOB: 1800,
    secondPaymentAmountBOB: 1800,
    firstPaymentReceived: { amountBOB: 1800, date: "2026-05-05", method: "cash" },
    secondPaymentReceived: null,
    startDate: "2026-05-01",
    description: "Instalación de red de gas domiciliaria para vivienda unifamiliar.",
    stage: "cancelled",
    stageHistory: [
      { id: "sh25", stage: "quotation", changedAt: "2026-05-01T09:00:00", note: "Proyecto creado." },
      { id: "sh26", stage: "contract", changedAt: "2026-05-04T10:00:00", note: "" },
      { id: "sh27", stage: "design", changedAt: "2026-05-06T09:00:00", note: "" },
      { id: "sh28", stage: "cancelled", changedAt: "2026-05-20T10:00:00", note: "Cliente desistió por cambio de domicilio." },
    ],
    tasks: [
      { id: "t12", stage: "design", description: "Elaborar plano de instalación interna", assignedTo: "2", isCompleted: true },
      { id: "t13", stage: "design", description: "Confirmar medidas con el cliente", assignedTo: "3", isCompleted: false },
    ],
    expenses: [
      { id: "e6", stage: "design", description: "Movilidad para levantamiento de medidas", amountBOB: 35, method: "cash", receiptUrl: "recibo-movilidad-005.jpg", date: "2026-05-06" },
    ],
    documents: [
      { id: "d7", stage: "design", fileName: "plano-tupuraya.pdf", uploadedBy: "2", uploadedAt: "2026-05-06T12:00:00" },
    ],
    approvalChecklist: buildDefaultApprovalChecklist(),
  },
  {
    id: "6",
    code: "PRY-0006",
    name: "Red de gas comercial - Hotel Real",
    category: "commercial",
    companyId: "santa-cruz",
    clientId: "10",
    isPrivate: true,
    totalValueBOB: 21000,
    firstPaymentAmountBOB: 10500,
    secondPaymentAmountBOB: 10500,
    firstPaymentReceived: null,
    secondPaymentReceived: null,
    startDate: "2026-06-15",
    description: "Instalación de red de gas para cocina y calefacción de hotel.",
    stage: "first_payment",
    stageHistory: [
      { id: "sh29", stage: "quotation", changedAt: "2026-06-15T09:00:00", note: "Proyecto creado." },
      { id: "sh30", stage: "contract", changedAt: "2026-06-18T10:00:00", note: "" },
      { id: "sh31", stage: "design", changedAt: "2026-06-22T09:00:00", note: "" },
      { id: "sh32", stage: "design_inspection", changedAt: "2026-06-28T11:00:00", note: "Aprobado sin observaciones." },
      { id: "sh33", stage: "first_payment", changedAt: "2026-07-02T09:00:00", note: "Esperando el primer desembolso del hotel." },
    ],
    tasks: [
      { id: "t14", stage: "design", description: "Elaborar plano de red para cocina", assignedTo: "2", isCompleted: true },
      { id: "t15", stage: "first_payment", description: "Enviar factura proforma al hotel", assignedTo: "1", isCompleted: true },
      { id: "t16", stage: "first_payment", description: "Confirmar fecha de desembolso", assignedTo: "1", isCompleted: false },
    ],
    expenses: [
      { id: "e7", stage: "design", description: "Impresión de planos para el hotel", amountBOB: 90, method: "cash", receiptUrl: "recibo-planos-006.jpg", date: "2026-06-22" },
    ],
    documents: [
      { id: "d8", stage: "design_inspection", fileName: "aprobacion-ypfb-hotel-real.pdf", uploadedBy: "1", uploadedAt: "2026-06-28T12:00:00" },
    ],
    approvalChecklist: buildDefaultApprovalChecklist(["submit_kmz", "design_approval"]),
  },
];
