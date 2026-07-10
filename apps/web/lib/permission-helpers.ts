import { MODULE_KEYS, MODULE_LABELS, type ModuleKey, type ModulePermission } from "@/lib/mocks/users-admin.mock";

const ALL_MODULES_ACCESS_LABEL = "Todos los módulos";
const NO_MODULES_ACCESS_LABEL = "Ninguno";
const MAX_VISIBLE_MODULE_LABELS = 3;

function buildPermissions(fullAccessModules: ModuleKey[], viewOnlyModules: ModuleKey[]): ModulePermission[] {
  return MODULE_KEYS.map((module) => ({
    module,
    canView: fullAccessModules.includes(module) || viewOnlyModules.includes(module),
    canCreate: fullAccessModules.includes(module),
    canEdit: fullAccessModules.includes(module),
  }));
}

export function buildEmptyPermissions(): ModulePermission[] {
  return buildPermissions([], []);
}

export function buildAdminPreset(): ModulePermission[] {
  return buildPermissions(MODULE_KEYS, []);
}

export function buildLogisticsPreset(): ModulePermission[] {
  return buildPermissions(["projects"], []);
}

export function buildSalesPreset(): ModulePermission[] {
  return buildPermissions([], ["sales", "clients", "inventory"]);
}

export function formatModuleAccessSummary(permissions: ModulePermission[]): string {
  const accessibleModules = permissions.filter((permission) => permission.canView);

  if (accessibleModules.length === 0) {
    return NO_MODULES_ACCESS_LABEL;
  }

  if (accessibleModules.length === MODULE_KEYS.length) {
    return ALL_MODULES_ACCESS_LABEL;
  }

  const visibleLabels = accessibleModules.slice(0, MAX_VISIBLE_MODULE_LABELS).map((permission) => MODULE_LABELS[permission.module]);
  const remainingCount = accessibleModules.length - visibleLabels.length;

  return remainingCount > 0 ? `${visibleLabels.join(", ")} +${remainingCount} más` : visibleLabels.join(", ");
}
