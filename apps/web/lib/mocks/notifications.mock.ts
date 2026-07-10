export type NotificationType =
  | "low_stock"
  | "pending_payment"
  | "overdue_payable"
  | "project_stage"
  | "general";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  linkUrl: string;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "low_stock",
    title: "Stock bajo",
    body: "Garrafa de gas 10kg tiene solo 4 unidades, por debajo del mínimo de 15.",
    createdAt: "2026-07-10T07:30:00",
    isRead: false,
    linkUrl: "/inventory",
  },
  {
    id: "2",
    type: "pending_payment",
    title: "Pago pendiente",
    body: "Hotel Real Cochabamba tiene un saldo pendiente de Bs. 8,200.00.",
    createdAt: "2026-07-10T06:15:00",
    isRead: false,
    linkUrl: "/clients",
  },
  {
    id: "3",
    type: "overdue_payable",
    title: "Cuenta por pagar vencida",
    body: "La cuota del préstamo vehicular con Banco Unión venció el 30 de junio.",
    createdAt: "2026-07-09T18:00:00",
    isRead: false,
    linkUrl: "/cash",
  },
  {
    id: "4",
    type: "project_stage",
    title: "Proyecto avanzó de etapa",
    body: "Red de gas - Edificio Torres del Sol pasó a la etapa de Primer pago.",
    createdAt: "2026-07-09T10:00:00",
    isRead: true,
    linkUrl: "/projects/2",
  },
  {
    id: "5",
    type: "general",
    title: "Mantenimiento programado",
    body: "El sistema estará en mantenimiento el sábado de 22:00 a 23:00.",
    createdAt: "2026-07-08T14:20:00",
    isRead: true,
    linkUrl: "/notifications",
  },
  {
    id: "6",
    type: "low_stock",
    title: "Stock bajo",
    body: "Detector de fugas tiene solo 1 unidad, por debajo del mínimo de 8.",
    createdAt: "2026-07-07T09:00:00",
    isRead: true,
    linkUrl: "/inventory",
  },
  {
    id: "7",
    type: "pending_payment",
    title: "Pago pendiente",
    body: "Constructora Andina S.R.L. tiene un saldo pendiente de Bs. 12,500.00.",
    createdAt: "2026-07-06T16:45:00",
    isRead: true,
    linkUrl: "/clients",
  },
  {
    id: "8",
    type: "project_stage",
    title: "Nuevo proyecto creado",
    body: "Se creó el proyecto Instalación domiciliaria - Queru Queru.",
    createdAt: "2026-07-05T11:00:00",
    isRead: true,
    linkUrl: "/projects/1",
  },
];
