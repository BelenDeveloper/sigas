"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { DOCUMENT_TYPE_LABELS, type Client } from "@/lib/mocks/clients.mock";

import { ClientDebtBadge } from "./ClientDebtBadge";

const NO_CLIENTS_MESSAGE = "No se encontraron clientes con estos filtros.";

interface ClientTableProps {
  clients: Client[];
  canDelete: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientTable({ clients, canDelete, onEdit, onDelete }: ClientTableProps) {
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
          <TableHead>Deuda total</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                {DOCUMENT_TYPE_LABELS[client.documentType]} {client.documentNumber}
              </TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.city}</TableCell>
              <TableCell>{client.neighborhood}</TableCell>
              <TableCell>
                <ClientDebtBadge totalDebtBOB={client.totalDebtBOB} />
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
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Eliminar cliente"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(client);
                      }}
                    >
                      <Trash2 className="size-4" />
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
