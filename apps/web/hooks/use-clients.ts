"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_CLIENT_CITY,
  MOCK_CLIENTS,
  MOCK_CLIENT_SALES,
  type Client,
  type ClientSale,
  type DocumentType,
} from "@/lib/mocks/clients.mock";

export const ALL_CITIES_OPTION = "all";

export interface ClientFilterState {
  searchTerm: string;
  city: string;
  hasPendingDebt: boolean;
}

export interface ClientInput {
  name: string;
  documentType: DocumentType;
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
  hasPendingDebt: false,
};

interface UseClientsResult {
  clients: Client[];
  cities: string[];
  filters: ClientFilterState;
  setFilters: (filters: Partial<ClientFilterState>) => void;
  createClient: (input: ClientInput) => void;
  updateClient: (clientId: string, input: ClientInput) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
  getSalesByClientId: (clientId: string) => ClientSale[];
}

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [filters, setFiltersState] = useState<ClientFilterState>(DEFAULT_FILTERS);

  const setFilters = (partialFilters: Partial<ClientFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...partialFilters }));
  };

  const cities = useMemo(() => {
    const uniqueCities = new Set(clients.map((client) => client.city));
    return Array.from(uniqueCities).sort();
  }, [clients]);

  const filteredClients = useMemo(() => {
    const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      if (filters.hasPendingDebt && client.totalDebtBOB <= 0) {
        return false;
      }

      if (filters.city !== ALL_CITIES_OPTION && client.city !== filters.city) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      return (
        client.name.toLowerCase().includes(normalizedSearchTerm) ||
        client.documentNumber.toLowerCase().includes(normalizedSearchTerm)
      );
    });
  }, [clients, filters]);

  const getClientById = (clientId: string) => clients.find((client) => client.id === clientId);

  const getSalesByClientId = (clientId: string) =>
    MOCK_CLIENT_SALES.filter((sale) => sale.clientId === clientId);

  const createClient = (input: ClientInput) => {
    const newClient: Client = {
      ...input,
      id: crypto.randomUUID(),
      totalDebtBOB: 0,
    };

    setClients((previous) => [...previous, newClient]);
  };

  const updateClient = (clientId: string, input: ClientInput) => {
    setClients((previous) =>
      previous.map((client) => (client.id === clientId ? { ...client, ...input } : client)),
    );
  };

  const deleteClient = (clientId: string) => {
    setClients((previous) => previous.filter((client) => client.id !== clientId));
  };

  return {
    clients: filteredClients,
    cities,
    filters,
    setFilters,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    getSalesByClientId,
  };
}

export { DEFAULT_CLIENT_CITY };
