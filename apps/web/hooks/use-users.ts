"use client";

import { useState } from "react";

import {
  MOCK_ADMIN_USERS,
  type AdminUser,
  type AdminUserRole,
  type ModulePermission,
} from "@/lib/mocks/users-admin.mock";

export interface UserProfileInput {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
}

export type UserProfileUpdateInput = Omit<UserProfileInput, "password">;

interface UseUsersResult {
  users: AdminUser[];
  createUser: (profile: UserProfileInput, permissions: ModulePermission[]) => void;
  updateUser: (userId: string, profile: UserProfileUpdateInput, permissions: ModulePermission[]) => void;
  toggleUserActive: (userId: string) => void;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_ADMIN_USERS);

  const createUser = (profile: UserProfileInput, permissions: ModulePermission[]) => {
    const newUser: AdminUser = {
      id: crypto.randomUUID(),
      name: profile.name,
      email: profile.email,
      role: profile.role,
      isActive: true,
      permissions,
    };

    setUsers((previous) => [...previous, newUser]);
  };

  const updateUser = (
    userId: string,
    profile: UserProfileUpdateInput,
    permissions: ModulePermission[],
  ) => {
    setUsers((previous) =>
      previous.map((user) => (user.id === userId ? { ...user, ...profile, permissions } : user)),
    );
  };

  const toggleUserActive = (userId: string) => {
    setUsers((previous) =>
      previous.map((user) => (user.id === userId ? { ...user, isActive: !user.isActive } : user)),
    );
  };

  return { users, createUser, updateUser, toggleUserActive };
}
