"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useClients } from "@/hooks/use-clients";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import type { Client } from "@/lib/client-types";
import { hasModulePermission } from "@/lib/permission-helpers";

import { ClientFilters } from "./ClientFilters";
import { ClientFormDialog } from "./ClientFormDialog";
import { ClientTable } from "./ClientTable";

const CLIENTS_MODULE = "clients";
const ADMIN_ROLE = "admin";
const RESTRICTED_ACCESS_MESSAGE = "No tienes permiso para ver esta sección.";

export function ClientsPage() {
  const authUser = useAtomValue(authUserAtom);
  const canViewClients = hasModulePermission(authUser, CLIENTS_MODULE, "canView");
  const canCreateClient = hasModulePermission(authUser, CLIENTS_MODULE, "canCreate");
  const canEditClient = hasModulePermission(authUser, CLIENTS_MODULE, "canEdit");
  const canToggleActive = authUser?.role === ADMIN_ROLE;

  const { clients, cities, filters, setFilters, createClient, updateClient, toggleClientActive } =
    useClients();

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  if (!canViewClients) {
    return <p className="text-muted-foreground">{RESTRICTED_ACCESS_MESSAGE}</p>;
  }

  const handleNewClient = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Buscar por nombre o documento"
          className="w-72"
          value={filters.searchTerm}
          onChange={(event) => setFilters({ searchTerm: event.target.value })}
        />
        {canCreateClient ? (
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={handleNewClient}
          >
            <Plus className="size-4" />
            Nuevo cliente
          </Button>
        ) : null}
      </div>

      <ClientFilters filters={filters} onFiltersChange={setFilters} cities={cities} />

      <ClientTable
        clients={clients}
        canEdit={canEditClient}
        canToggleActive={canToggleActive}
        onEdit={handleEditClient}
        onToggleActive={(client) => toggleClientActive(client.id)}
      />

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
        onCreate={createClient}
        onUpdate={updateClient}
      />
    </div>
  );
}
