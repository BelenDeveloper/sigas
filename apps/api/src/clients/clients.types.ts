import type { Client, ClientDiscountType, ClientDocumentType } from "@repo/db";

export type { Client };

// getSaleBalance-style debt fields (totalSales, totalPaid, totalPending) will be
// added to findById/getClientDebt once the Sales module exists.
export interface ClientFilters {
  search?: string;
  city?: string;
}

export interface CreateClientInput {
  name: string;
  documentType?: ClientDocumentType;
  documentNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  notes?: string;
  defaultDiscountType?: ClientDiscountType;
  defaultDiscountValue?: number;
}

export interface UpdateClientInput extends CreateClientInput {
  isActive: boolean;
}

export class ClientNotFoundError extends Error {
  constructor(clientId: string) {
    super(`Client not found: ${clientId}`);
    this.name = "ClientNotFoundError";
  }
}
