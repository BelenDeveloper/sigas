import type { Supplier } from "@repo/db";

export type { Supplier };

export interface SupplierFilters {
  search?: string;
  country?: string;
  showInactive?: boolean;
}

export interface CreateSupplierInput {
  companyName: string;
  contactName?: string;
  nit?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface UpdateSupplierInput extends CreateSupplierInput {
  isActive: boolean;
}

export class SupplierNotFoundError extends Error {
  constructor(supplierId: string) {
    super(`Supplier not found: ${supplierId}`);
    this.name = "SupplierNotFoundError";
  }
}
