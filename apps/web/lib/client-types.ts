export const CLIENT_DOCUMENT_TYPES = ["CI", "NIT", "passport"] as const;
export type ClientDocumentType = (typeof CLIENT_DOCUMENT_TYPES)[number];

export const CLIENT_DOCUMENT_TYPE_LABELS: Record<ClientDocumentType, string> = {
  CI: "CI",
  NIT: "NIT",
  passport: "Pasaporte",
};

export const DEFAULT_CLIENT_CITY = "Cochabamba";

export interface Client {
  id: string;
  name: string;
  documentType: ClientDocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  isActive: boolean;
}
