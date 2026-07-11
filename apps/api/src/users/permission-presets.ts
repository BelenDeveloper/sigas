import { MODULES, type ModuleKey } from "@repo/db";

import type { ModulePermission } from "./users.types.js";

interface PermissionPresetConfig {
  canViewModules?: ModuleKey[];
  canCreateModules?: ModuleKey[];
  canEditModules?: ModuleKey[];
}

function buildPermissions(config: PermissionPresetConfig): ModulePermission[] {
  const canViewModules = config.canViewModules ?? [];
  const canCreateModules = config.canCreateModules ?? [];
  const canEditModules = config.canEditModules ?? [];

  return MODULES.map((module) => ({
    module,
    canView: canViewModules.includes(module),
    canCreate: canCreateModules.includes(module),
    canEdit: canEditModules.includes(module),
  }));
}

export function buildAdminPermissions(): ModulePermission[] {
  return buildPermissions({
    canViewModules: [...MODULES],
    canCreateModules: [...MODULES],
    canEditModules: [...MODULES],
  });
}

export function buildLogisticsPermissions(): ModulePermission[] {
  return buildPermissions({
    canViewModules: ["projects"],
    canCreateModules: ["projects"],
    canEditModules: ["projects"],
  });
}

export function buildSalesPermissions(): ModulePermission[] {
  const salesModules: ModuleKey[] = ["sales", "clients", "inventory"];
  return buildPermissions({ canViewModules: salesModules, canCreateModules: salesModules });
}

export function buildNoPermissions(): ModulePermission[] {
  return buildPermissions({});
}
