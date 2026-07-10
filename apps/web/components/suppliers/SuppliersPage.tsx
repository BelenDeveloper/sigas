"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useSuppliers } from "@/hooks/use-suppliers";
import type { Supplier } from "@/lib/mocks/suppliers.mock";

import { SupplierFormDialog } from "./SupplierFormDialog";
import { SupplierTable } from "./SupplierTable";

export function SuppliersPage() {
  const { suppliers, searchTerm, setSearchTerm, createSupplier, updateSupplier, toggleSupplierActive } =
    useSuppliers();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

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
        <Button
          className="bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={handleNewSupplier}
        >
          <Plus className="size-4" />
          Nuevo proveedor
        </Button>
      </div>

      <SupplierTable
        suppliers={suppliers}
        onEdit={handleEditSupplier}
        onToggleActive={(supplier) => toggleSupplierActive(supplier.id)}
      />

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={editingSupplier}
        onCreate={createSupplier}
        onUpdate={updateSupplier}
      />
    </div>
  );
}
