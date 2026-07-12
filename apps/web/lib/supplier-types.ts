export const DEFAULT_SUPPLIER_COUNTRY = "Bolivia";

export interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  isActive: boolean;
}
