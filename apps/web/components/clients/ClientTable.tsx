"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Eye, Loader2, Pencil, Power } from "lucide-react";
import { useRouter } from "next/navigation";

import { CLIENT_DOCUMENT_TYPE_LABELS, type Client } from "@/lib/client-types";

import { TableSkeleton } from "../shared/TableSkeleton";

const NO_CLIENTS_MESSAGE = "No se encontraron clientes con estos filtros.";
const ACTIVE_LABEL = "Activo";
const INACTIVE_LABEL = "Inactivo";
const ACTIVE_BADGE_CLASSES = "bg-emerald-100 text-emerald-800";
const COLUMN_COUNT = 7;

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  canEdit: boolean;
  canToggleActive: boolean;
  togglingClientId: string | null;
  onEdit: (client: Client) => void;
  onToggleActive: (client: Client) => void;
}

export function ClientTable({
  clients,
  isLoading,
  canEdit,
  canToggleActive,
  togglingClientId,
  onEdit,
  onToggleActive,
}: ClientTableProps) {
  const router = useRouter();

  const goToClientDetail = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>NIT/CI</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Ciudad</TableHead>
          <TableHead>Barrio</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeleton columns={COLUMN_COUNT} />
        ) : clients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLUMN_COUNT} className="text-center text-muted-foreground">
              {NO_CLIENTS_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          clients.map((client) => (
            <TableRow
              key={client.id}
              className="cursor-pointer"
              onClick={() => goToClientDetail(client.id)}
            >
              <TableCell className="font-medium text-foreground">{client.name}</TableCell>
              <TableCell>
                {CLIENT_DOCUMENT_TYPE_LABELS[client.documentType]} {client.documentNumber}
              </TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.city}</TableCell>
              <TableCell>{client.neighborhood}</TableCell>
              <TableCell>
                <Badge
                  variant={client.isActive ? undefined : "secondary"}
                  className={client.isActive ? ACTIVE_BADGE_CLASSES : undefined}
                >
                  {client.isActive ? ACTIVE_LABEL : INACTIVE_LABEL}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ver cliente"
                    onClick={(event) => {
                      event.stopPropagation();
                      goToClientDetail(client.id);
                    }}
                  >
                    <Eye className="size-4" />
                  </Button>
                  {canEdit ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar cliente"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(client);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  ) : null}
                  {canToggleActive ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={client.isActive ? "Desactivar cliente" : "Activar cliente"}
                      disabled={togglingClientId === client.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleActive(client);
                      }}
                    >
                      {togglingClientId === client.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Power className="size-4" />
                      )}
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
