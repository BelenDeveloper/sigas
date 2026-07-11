"use client";

import { trpc } from "@/lib/trpc/client";
import type { AdminUser, AdminUserRole, ModulePermission } from "@/lib/user-permissions";

export interface UserProfileInput {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
}

export type UserProfileUpdateInput = Omit<UserProfileInput, "password" | "email">;

interface UseUsersResult {
  users: AdminUser[];
  createUser: (profile: UserProfileInput, permissions: ModulePermission[]) => void;
  updateUser: (userId: string, profile: UserProfileUpdateInput, permissions: ModulePermission[]) => void;
  toggleUserActive: (userId: string) => void;
}

export function useUsers(): UseUsersResult {
  const utils = trpc.useUtils();
  const { data } = trpc.users.list.useQuery();

  const invalidateUsers = () => void utils.users.list.invalidate();

  const createMutation = trpc.users.create.useMutation({ onSuccess: invalidateUsers });
  const updateMutation = trpc.users.update.useMutation({ onSuccess: invalidateUsers });
  const updatePermissionsMutation = trpc.users.updatePermissions.useMutation({
    onSuccess: invalidateUsers,
  });
  const toggleActiveMutation = trpc.users.toggleActive.useMutation({ onSuccess: invalidateUsers });

  const createUser = (profile: UserProfileInput, permissions: ModulePermission[]) => {
    createMutation.mutate({ ...profile, permissions });
  };

  const updateUser = (
    userId: string,
    profile: UserProfileUpdateInput,
    permissions: ModulePermission[],
  ) => {
    const currentUser = data?.find((user) => user.id === userId);

    updateMutation.mutate({
      id: userId,
      name: profile.name,
      role: profile.role,
      isActive: currentUser?.isActive ?? true,
    });
    updatePermissionsMutation.mutate({ userId, permissions });
  };

  const toggleUserActive = (userId: string) => {
    toggleActiveMutation.mutate({ id: userId });
  };

  return { users: data ?? [], createUser, updateUser, toggleUserActive };
}
