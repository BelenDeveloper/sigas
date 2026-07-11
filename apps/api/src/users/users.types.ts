import type { ModuleKey, UserRole } from "@repo/db";

export interface ModulePermission {
  module: ModuleKey;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
}

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: ModulePermission[];
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: ModulePermission[];
}

export interface UpdateUserInput {
  name: string;
  role: UserRole;
  isActive: boolean;
}
