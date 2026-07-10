"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useUsers } from "@/hooks/use-users";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import type { AdminUser } from "@/lib/mocks/users-admin.mock";

import { UserFormDialog } from "./UserFormDialog";
import { UserTable } from "./UserTable";

const ADMIN_ROLE = "admin";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";

export function UsersPage() {
  const authUser = useAtomValue(authUserAtom);
  const isAdmin = authUser?.role === ADMIN_ROLE;

  const { users, createUser, updateUser, toggleUserActive } = useUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  if (!isAdmin) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  const handleNewUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleNewUser}>
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      <UserTable
        users={users}
        onEdit={handleEditUser}
        onToggleActive={(user) => toggleUserActive(user.id)}
      />

      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={editingUser}
        onCreate={createUser}
        onUpdate={updateUser}
      />
    </div>
  );
}
