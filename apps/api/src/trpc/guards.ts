import type { ModuleKey } from "@repo/db";
import { TRPCError } from "@trpc/server";

import type { ModulePermission } from "../users/users.types.js";
import type { TrpcContext } from "./trpc-context.js";

const ADMIN_ROLE = "admin";
const FORBIDDEN_MESSAGE = "You do not have permission to perform this action.";

export type PermissionAction = "view" | "create" | "edit";

function getActionFlag(permission: ModulePermission, action: PermissionAction): boolean {
  switch (action) {
    case "view":
      return permission.canView;
    case "create":
      return permission.canCreate;
    case "edit":
      return permission.canEdit;
  }
}

export function requirePermission(
  ctx: TrpcContext,
  module: ModuleKey,
  action: PermissionAction,
): void {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.user.role === ADMIN_ROLE) {
    return;
  }

  const permission = ctx.user.permissions.find((candidate) => candidate.module === module);
  const hasPermission = permission ? getActionFlag(permission, action) : false;

  if (!hasPermission) {
    throw new TRPCError({ code: "FORBIDDEN", message: FORBIDDEN_MESSAGE });
  }
}
