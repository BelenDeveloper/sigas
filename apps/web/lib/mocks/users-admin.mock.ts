export type ModuleKey =
  | "dashboard"
  | "inventory"
  | "clients"
  | "suppliers"
  | "sales"
  | "purchases"
  | "cash"
  | "projects"
  | "notifications"
  | "settings"
  | "companies";

export const MODULE_KEYS: ModuleKey[] = [
  "dashboard",
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
];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Inicio",
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

function buildPermissions(
  fullAccessModules: ModuleKey[] = [],
  viewOnlyModules: ModuleKey[] = [],
): ModulePermission[] {
  return MODULE_KEYS.map((module) => ({
    module,
    canView: fullAccessModules.includes(module) || viewOnlyModules.includes(module),
    canCreate: fullAccessModules.includes(module),
    canEdit: fullAccessModules.includes(module),
  }));
}

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "1",
    name: "Cristian Zaballa",
    email: "cristian@sigas.bo",
    role: "admin",
    isActive: true,
    permissions: buildPermissions(MODULE_KEYS),
  },
  {
    id: "2",
    name: "Harold",
    email: "harold@sigas.bo",
    role: "logistics",
    isActive: true,
    permissions: buildPermissions(["projects"]),
  },
  {
    id: "3",
    name: "Mirael",
    email: "mirael@sigas.bo",
    role: "sales",
    isActive: true,
    permissions: buildPermissions([], ["sales", "clients", "inventory"]),
  },
  {
    id: "4",
    name: "Natalia",
    email: "natalia@sigas.bo",
    role: "custom",
    isActive: false,
    permissions: buildPermissions([], ["dashboard", "clients"]),
  },
];
