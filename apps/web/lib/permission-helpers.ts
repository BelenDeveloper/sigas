import { MODULE_KEYS, MODULE_LABELS, type ModuleKey, type ModulePermission } from "@/lib/user-permissions";

const ALL_MODULES_ACCESS_LABEL = "Todos los módulos";
const NO_MODULES_ACCESS_LABEL = "Ninguno";
const MAX_VISIBLE_MODULE_LABELS = 3;

interface PermissionPresetConfig {
  canViewModules?: ModuleKey[];
  canCreateModules?: ModuleKey[];
  canEditModules?: ModuleKey[];
}

function buildPermissions(config: PermissionPresetConfig): ModulePermission[] {
  const canViewModules = config.canViewModules ?? [];
  const canCreateModules = config.canCreateModules ?? [];
  const canEditModules = config.canEditModules ?? [];

  return MODULE_KEYS.map((module) => ({
    module,
    canView: canViewModules.includes(module),
    canCreate: canCreateModules.includes(module),
    canEdit: canEditModules.includes(module),
  }));
}

export function buildEmptyPermissions(): ModulePermission[] {
  return buildPermissions({});
}

export function buildAdminPreset(): ModulePermission[] {
  return buildPermissions({
    canViewModules: MODULE_KEYS,
    canCreateModules: MODULE_KEYS,
    canEditModules: MODULE_KEYS,
  });
}

export function buildLogisticsPreset(): ModulePermission[] {
  return buildPermissions({
    canViewModules: ["projects"],
    canCreateModules: ["projects"],
    canEditModules: ["projects"],
  });
}

export function buildSalesPreset(): ModulePermission[] {
  const salesModules: ModuleKey[] = ["sales", "clients", "inventory"];
  return buildPermissions({ canViewModules: salesModules, canCreateModules: salesModules });
}

export function formatModuleAccessSummary(permissions: ModulePermission[]): string {
  const accessibleModules = permissions.filter((permission) => permission.canView);

  if (accessibleModules.length === 0) {
    return NO_MODULES_ACCESS_LABEL;
  }

  if (accessibleModules.length === MODULE_KEYS.length) {
    return ALL_MODULES_ACCESS_LABEL;
  }

  const visibleLabels = accessibleModules
    .slice(0, MAX_VISIBLE_MODULE_LABELS)
    .map((permission) => MODULE_LABELS[permission.module]);
  const remainingCount = accessibleModules.length - visibleLabels.length;

  return remainingCount > 0 ? `${visibleLabels.join(", ")} +${remainingCount} más` : visibleLabels.join(", ");
}
