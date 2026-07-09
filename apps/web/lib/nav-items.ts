import {
  Bell,
  Building2,
  ClipboardList,
  HardHat,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isAdminOnly?: boolean;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/", icon: LayoutDashboard },
  { label: "Inventario", href: "/inventory", icon: Package },
  { label: "Clientes", href: "/clients", icon: Users },
  { label: "Proveedores", href: "/suppliers", icon: Truck },
  { label: "Ventas", href: "/sales", icon: ShoppingCart },
  { label: "Compras", href: "/purchases", icon: ClipboardList },
  { label: "Caja y Finanzas", href: "/cash", icon: Wallet },
  { label: "Proyectos", href: "/projects", icon: HardHat },
];

export const NOTIFICATIONS_NAV_ITEM: NavItem = {
  label: "Notificaciones",
  href: "/notifications",
  icon: Bell,
};

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { label: "Configuración", href: "/settings", icon: Settings },
  { label: "Empresas", href: "/companies", icon: Building2, isAdminOnly: true },
  { label: "Usuarios", href: "/users", icon: UserCog, isAdminOnly: true },
];

export const ALL_NAV_ITEMS: NavItem[] = [
  ...PRIMARY_NAV_ITEMS,
  NOTIFICATIONS_NAV_ITEM,
  ...SETTINGS_NAV_ITEMS,
];
