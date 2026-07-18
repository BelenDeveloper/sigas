"use client";

import { useMemo, useState } from "react";

import type { Client, ClientDocumentType } from "@/lib/client-types";
import { trpc } from "@/lib/trpc/client";

export const ALL_CITIES_OPTION = "all";
const DEFAULT_DOCUMENT_TYPE: ClientDocumentType = "CI";

export interface ClientFilterState {
  searchTerm: string;
  city: string;
}

export interface ClientInput {
  name: string;
  documentType: ClientDocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
}

const DEFAULT_FILTERS: ClientFilterState = {
  searchTerm: "",
  city: ALL_CITIES_OPTION,
};

interface UseClientsResult {
  clients: Client[];
  cities: string[];
  filters: ClientFilterState;
  setFilters: (filters: Partial<ClientFilterState>) => void;
  createClient: (input: ClientInput) => Promise<void>;
  updateClient: (clientId: string, input: ClientInput) => Promise<void>;
  toggleClientActive: (clientId: string) => Promise<void>;
  getClientById: (clientId: string) => Client | undefined;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  togglingClientId: string | null;
}

function toClientInput(input: ClientInput) {
  return {
    name: input.name,
    documentType: input.documentType,
    documentNumber: input.documentNumber || undefined,
    phone: input.phone || undefined,
    email: input.email || undefined,
    address: input.address || undefined,
    neighborhood: input.neighborhood || undefined,
    city: input.city || undefined,
  };
}

export function useClients(): UseClientsResult {
  const utils = trpc.useUtils();

  const [filters, setFiltersState] = useState<ClientFilterState>(DEFAULT_FILTERS);

  const setFilters = (partialFilters: Partial<ClientFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...partialFilters }));
  };

  const { data: rawClients } = trpc.clients.list.useQuery({
    search: filters.searchTerm || undefined,
    city: filters.city !== ALL_CITIES_OPTION ? filters.city : undefined,
  });

  const { data: rawAllClients } = trpc.clients.list.useQuery({});

  const invalidateClients = () => void utils.clients.list.invalidate();

  const createMutation = trpc.clients.create.useMutation({ onSuccess: invalidateClients });
  const updateMutation = trpc.clients.update.useMutation({ onSuccess: invalidateClients });
  const toggleActiveMutation = trpc.clients.toggleActive.useMutation({ onSuccess: invalidateClients });

  const toClient = (client: {
    id: string;
    name: string;
    documentType: ClientDocumentType | null;
    documentNumber: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    neighborhood: string | null;
    city: string;
    isActive: boolean;
  }): Client => ({
    id: client.id,
    name: client.name,
    documentType: client.documentType ?? DEFAULT_DOCUMENT_TYPE,
    documentNumber: client.documentNumber ?? "",
    phone: client.phone ?? "",
    email: client.email ?? "",
    address: client.address ?? "",
    neighborhood: client.neighborhood ?? "",
    city: client.city,
    isActive: client.isActive,
  });

  const clients = useMemo(() => (rawClients ?? []).map(toClient), [rawClients]);
  const allClients = useMemo(() => (rawAllClients ?? []).map(toClient), [rawAllClients]);

  const cities = useMemo(() => {
    const uniqueCities = new Set(allClients.map((client) => client.city));
    return Array.from(uniqueCities).sort();
  }, [allClients]);

  const getClientById = (clientId: string) =>
    allClients.find((client) => client.id === clientId);

  const createClient = async (input: ClientInput) => {
    await createMutation.mutateAsync(toClientInput(input));
  };

  const updateClient = async (clientId: string, input: ClientInput) => {
    const currentClient = getClientById(clientId);

    await updateMutation.mutateAsync({
      id: clientId,
      ...toClientInput(input),
      isActive: currentClient?.isActive ?? true,
    });
  };

  const toggleClientActive = async (clientId: string) => {
    await toggleActiveMutation.mutateAsync({ id: clientId });
  };

  return {
    clients,
    cities,
    filters,
    setFilters,
    createClient,
    updateClient,
    toggleClientActive,
    getClientById,
    isLoading: rawAllClients === undefined,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    togglingClientId: toggleActiveMutation.isPending
      ? (toggleActiveMutation.variables?.id ?? null)
      : null,
  };
}
