export type ModuleKey =
  | "inventory"
  | "clients"
  | "suppliers"
  | "sales"
  | "purchases"
  | "cash"
  | "projects"
  | "notifications"
  | "settings"
  | "companies"
  | "users";

export const MODULE_KEYS: ModuleKey[] = [
  "inventory",
  "clients",
  "suppliers",
  "sales",
  "purchases",
  "cash",
  "projects",
  "notifications",
  "settings",
  "companies",
  "users",
];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  inventory: "Inventario",
  clients: "Clientes",
  suppliers: "Proveedores",
  sales: "Ventas",
  purchases: "Compras",
  cash: "Caja y Finanzas",
  projects: "Proyectos",
  notifications: "Notificaciones",
  settings: "Configuración",
  companies: "Empresas",
  users: "Usuarios",
};

export interface ModulePermission {
  module: ModuleKey;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
}

export type AdminUserRole = "admin" | "logistics" | "sales" | "custom";

export const ADMIN_USER_ROLES: AdminUserRole[] = ["admin", "logistics", "sales", "custom"];

export const ADMIN_USER_ROLE_LABELS: Record<AdminUserRole, string> = {
  admin: "Administrador",
  logistics: "Logística",
  sales: "Ventas",
  custom: "Personalizado",
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
  permissions: ModulePermission[];
}
