"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useClients } from "@/hooks/use-clients";
import { DOCUMENT_TYPE_LABELS } from "@/lib/mocks/clients.mock";

import { ClientDebtBadge } from "./ClientDebtBadge";
import { ClientSaleHistory } from "./ClientSaleHistory";

const CLIENT_NOT_FOUND_MESSAGE = "No se encontró el cliente solicitado.";
const CLIENTS_ROUTE = "/clients";

interface ClientDetailPageProps {
  clientId: string;
}

export function ClientDetailPage({ clientId }: ClientDetailPageProps) {
  const { getClientById, getSalesByClientId } = useClients();
  const client = getClientById(clientId);

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

  const sales = getSalesByClientId(clientId);

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
          <ClientDebtBadge totalDebtBOB={client.totalDebtBOB} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Documento</span>
            <span className="text-sm text-foreground">
              {DOCUMENT_TYPE_LABELS[client.documentType]} {client.documentNumber}
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

      <ClientSaleHistory sales={sales} />
    </div>
  );
}
