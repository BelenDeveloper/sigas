"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useClients } from "@/hooks/use-clients";
import { CLIENT_DOCUMENT_TYPE_LABELS } from "@/lib/client-types";

const CLIENT_NOT_FOUND_MESSAGE = "No se encontró el cliente solicitado.";
const CLIENTS_ROUTE = "/clients";
const ACTIVE_LABEL = "Activo";
const INACTIVE_LABEL = "Inactivo";
const ACTIVE_BADGE_CLASSES = "bg-emerald-100 text-emerald-800";

interface ClientDetailPageProps {
  clientId: string;
}

export function ClientDetailPage({ clientId }: ClientDetailPageProps) {
  const { getClientById, isLoading } = useClients();
  const client = getClientById(clientId);

  if (isLoading) {
    return null;
  }

  if (!client) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{CLIENT_NOT_FOUND_MESSAGE}</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={CLIENTS_ROUTE} />}
          className="w-fit"
        >
          <ArrowLeft className="size-4" />
          Volver a clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={CLIENTS_ROUTE} />}
        className="w-fit"
      >
        <ArrowLeft className="size-4" />
        Volver a clientes
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <CardTitle className="text-xl">{client.name}</CardTitle>
          <Badge
            variant={client.isActive ? undefined : "secondary"}
            className={client.isActive ? ACTIVE_BADGE_CLASSES : undefined}
          >
            {client.isActive ? ACTIVE_LABEL : INACTIVE_LABEL}
          </Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Documento</span>
            <span className="text-sm text-foreground">
              {CLIENT_DOCUMENT_TYPE_LABELS[client.documentType]} {client.documentNumber}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Teléfono</span>
            <span className="text-sm text-foreground">{client.phone || "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Correo electrónico</span>
            <span className="text-sm text-foreground">{client.email || "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Dirección</span>
            <span className="text-sm text-foreground">{client.address || "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Barrio</span>
            <span className="text-sm text-foreground">{client.neighborhood || "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Ciudad</span>
            <span className="text-sm text-foreground">{client.city || "—"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
