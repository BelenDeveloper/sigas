"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useSuppliers } from "@/hooks/use-suppliers";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { hasModulePermission } from "@/lib/permission-helpers";
import type { Supplier } from "@/lib/supplier-types";

import { SupplierFormDialog } from "./SupplierFormDialog";
import { SupplierTable } from "./SupplierTable";

const SUPPLIERS_MODULE = "suppliers";
const ADMIN_ROLE = "admin";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";

export function SuppliersPage() {
  const authUser = useAtomValue(authUserAtom);
  const canViewSuppliers = hasModulePermission(authUser, SUPPLIERS_MODULE, "canView");
  const canCreateSupplier = hasModulePermission(authUser, SUPPLIERS_MODULE, "canCreate");
  const canEditSupplier = hasModulePermission(authUser, SUPPLIERS_MODULE, "canEdit");
  const canToggleActive = authUser?.role === ADMIN_ROLE;

  const {
    suppliers,
    searchTerm,
    setSearchTerm,
    createSupplier,
    updateSupplier,
    toggleSupplierActive,
    isLoading,
    isCreating,
    isUpdating,
    togglingSupplierId,
  } = useSuppliers();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  if (!canViewSuppliers) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Buscar por empresa, contacto o NIT"
          className="w-72"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {canCreateSupplier ? (
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={handleNewSupplier}
          >
            <Plus className="size-4" />
            Nuevo proveedor
          </Button>
        ) : null}
      </div>

      <SupplierTable
        suppliers={suppliers}
        isLoading={isLoading}
        canEdit={canEditSupplier}
        canToggleActive={canToggleActive}
        togglingSupplierId={togglingSupplierId}
        onEdit={handleEditSupplier}
        onToggleActive={(supplier) => {
          toggleSupplierActive(supplier.id).catch(() => undefined);
        }}
      />

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={editingSupplier}
        isCreating={isCreating}
        isUpdating={isUpdating}
        onCreate={createSupplier}
        onUpdate={updateSupplier}
      />
    </div>
  );
}
