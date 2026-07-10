"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useClients } from "@/hooks/use-clients";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import type { Client } from "@/lib/mocks/clients.mock";

import { ClientDeleteAlertDialog } from "./ClientDeleteAlertDialog";
import { ClientFilters } from "./ClientFilters";
import { ClientFormDialog } from "./ClientFormDialog";
import { ClientTable } from "./ClientTable";

const ADMIN_ROLE = "admin";

export function ClientsPage() {
  const authUser = useAtomValue(authUserAtom);
  const isAdmin = authUser?.role === ADMIN_ROLE;

  const { clients, cities, filters, setFilters, createClient, updateClient, deleteClient } =
    useClients();

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientPendingDelete, setClientPendingDelete] = useState<Client | null>(null);

  const handleNewClient = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setClientPendingDelete(client);
    setDeleteDialogOpen(true);
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
        {isAdmin ? (
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
        canDelete={isAdmin}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
        onCreate={createClient}
        onUpdate={updateClient}
      />

      <ClientDeleteAlertDialog
        client={clientPendingDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={deleteClient}
      />
    </div>
  );
}
