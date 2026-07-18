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
  createUser: (profile: UserProfileInput, permissions: ModulePermission[]) => Promise<void>;
  updateUser: (
    userId: string,
    profile: UserProfileUpdateInput,
    permissions: ModulePermission[],
  ) => Promise<void>;
  toggleUserActive: (userId: string) => Promise<void>;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  togglingUserId: string | null;
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

  const createUser = async (profile: UserProfileInput, permissions: ModulePermission[]) => {
    await createMutation.mutateAsync({ ...profile, permissions });
  };

  const updateUser = async (
    userId: string,
    profile: UserProfileUpdateInput,
    permissions: ModulePermission[],
  ) => {
    const currentUser = data?.find((user) => user.id === userId);

    await Promise.all([
      updateMutation.mutateAsync({
        id: userId,
        name: profile.name,
        role: profile.role,
        isActive: currentUser?.isActive ?? true,
      }),
      updatePermissionsMutation.mutateAsync({ userId, permissions }),
    ]);
  };

  const toggleUserActive = async (userId: string) => {
    await toggleActiveMutation.mutateAsync({ id: userId });
  };

  return {
    users: data ?? [],
    createUser,
    updateUser,
    toggleUserActive,
    isLoading: data === undefined,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending || updatePermissionsMutation.isPending,
    togglingUserId: toggleActiveMutation.isPending
      ? (toggleActiveMutation.variables?.id ?? null)
      : null,
  };
}
