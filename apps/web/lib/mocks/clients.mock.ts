export type DocumentType = "CI" | "NIT" | "Passport";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CI: "CI",
  NIT: "NIT",
  Passport: "Pasaporte",
};

export interface Client {
  id: string;
  name: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  totalDebtBOB: number;
}

export const DEFAULT_CLIENT_CITY = "Cochabamba";

export const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Rodrigo Áñez Prado",
    documentType: "CI",
    documentNumber: "5487621",
    phone: "70123456",
    email: "rodrigo.anez@gmail.com",
    address: "Av. Blanco Galindo km 4",
    neighborhood: "Queru Queru",
    city: "Cochabamba",
    totalDebtBOB: 850,
  },
  {
    id: "2",
    name: "María Elena Vargas Quiroga",
    documentType: "NIT",
    documentNumber: "1023456019",
    phone: "70234567",
    email: "maria.vargas@hotmail.com",
    address: "Calle España 245",
    neighborhood: "Cala Cala",
    city: "Cochabamba",
    totalDebtBOB: 0,
  },
  {
    id: "3",
    name: "Juan Carlos Delgado Rocha",
    documentType: "CI",
    documentNumber: "3982104",
    phone: "70345678",
    email: "jc.delgado@gmail.com",
    address: "Av. América Este 1120",
    neighborhood: "Mayorazgo",
    city: "Cochabamba",
    totalDebtBOB: 1200,
  },
  {
    id: "4",
    name: "Ana Lucía Fernández Salazar",
    documentType: "CI",
    documentNumber: "6215498",
    phone: "70456789",
    email: "ana.fernandez@gmail.com",
    address: "Calle 25 de Mayo 780",
    neighborhood: "Muyurina",
    city: "Cochabamba",
    totalDebtBOB: 0,
  },
  {
    id: "5",
    name: "Pedro Antonio Gutiérrez Mamani",
    documentType: "NIT",
    documentNumber: "2098765014",
    phone: "70567890",
    email: "pedro.gutierrez@empresa.com.bo",
    address: "3er Anillo Externo, entre Radial 27",
    neighborhood: "Equipetrol",
    city: "Santa Cruz",
    totalDebtBOB: 3400,
  },
  {
    id: "6",
    name: "Carla Beatriz Rojas Terrazas",
    documentType: "CI",
    documentNumber: "4756321",
    phone: "70678901",
    email: "carla.rojas@gmail.com",
    address: "Calle Tupuraya 456",
    neighborhood: "Tupuraya",
    city: "Cochabamba",
    totalDebtBOB: 0,
  },
  {
    id: "7",
    name: "Luis Fernando Paz Coca",
    documentType: "CI",
    documentNumber: "7123890",
    phone: "70789012",
    email: "luis.paz@gmail.com",
    address: "Calle Ecuador 1560",
    neighborhood: "Sopocachi",
    city: "La Paz",
    totalDebtBOB: 620,
  },
  {
    id: "8",
    name: "Gabriela Soledad Montaño Ibáñez",
    documentType: "NIT",
    documentNumber: "3456712098",
    phone: "70890123",
    email: "gabriela.montano@empresa.com.bo",
    address: "Av. América Oeste 2340",
    neighborhood: "América",
    city: "Cochabamba",
    totalDebtBOB: 0,
  },
  {
    id: "9",
    name: "Ricardo Andrés Salinas Peredo",
    documentType: "CI",
    documentNumber: "8901234",
    phone: "70901234",
    email: "ricardo.salinas@gmail.com",
    address: "Av. 6 de Agosto 90",
    neighborhood: "Jaihuayco",
    city: "Cochabamba",
    totalDebtBOB: 1950,
  },
  {
    id: "10",
    name: "Verónica Patricia Cardozo Villca",
    documentType: "Passport",
    documentNumber: "N0873421",
    phone: "70012345",
    email: "veronica.cardozo@gmail.com",
    address: "Av. San Martín 340",
    neighborhood: "Las Palmas",
    city: "Santa Cruz",
    totalDebtBOB: 0,
  },
];

export type SalePaymentStatus = "paid" | "pending" | "partial";

export const SALE_PAYMENT_STATUS_LABELS: Record<SalePaymentStatus, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  partial: "Parcial",
};

export interface ClientSale {
  id: string;
  clientId: string;
  date: string;
  invoiceNumber: string;
  totalBOB: number;
  paymentStatus: SalePaymentStatus;
}

export const MOCK_CLIENT_SALES: ClientSale[] = [
  { id: "s1", clientId: "1", date: "2026-05-10", invoiceNumber: "FAC-1001", totalBOB: 450, paymentStatus: "paid" },
  { id: "s2", clientId: "1", date: "2026-06-18", invoiceNumber: "FAC-1042", totalBOB: 850, paymentStatus: "pending" },
  { id: "s3", clientId: "2", date: "2026-04-22", invoiceNumber: "FAC-0987", totalBOB: 320, paymentStatus: "paid" },
  { id: "s4", clientId: "2", date: "2026-06-02", invoiceNumber: "FAC-1055", totalBOB: 610, paymentStatus: "paid" },
  { id: "s5", clientId: "3", date: "2026-05-05", invoiceNumber: "FAC-1010", totalBOB: 900, paymentStatus: "paid" },
  { id: "s6", clientId: "3", date: "2026-06-14", invoiceNumber: "FAC-1048", totalBOB: 1200, paymentStatus: "pending" },
  { id: "s7", clientId: "4", date: "2026-03-30", invoiceNumber: "FAC-0850", totalBOB: 280, paymentStatus: "paid" },
  { id: "s8", clientId: "5", date: "2026-04-15", invoiceNumber: "FAC-0960", totalBOB: 2200, paymentStatus: "paid" },
  { id: "s9", clientId: "5", date: "2026-05-28", invoiceNumber: "FAC-1030", totalBOB: 1800, paymentStatus: "partial" },
  { id: "s10", clientId: "5", date: "2026-06-20", invoiceNumber: "FAC-1060", totalBOB: 1600, paymentStatus: "pending" },
  { id: "s11", clientId: "6", date: "2026-05-11", invoiceNumber: "FAC-1012", totalBOB: 540, paymentStatus: "paid" },
  { id: "s12", clientId: "7", date: "2026-05-20", invoiceNumber: "FAC-1020", totalBOB: 620, paymentStatus: "pending" },
  { id: "s13", clientId: "8", date: "2026-04-08", invoiceNumber: "FAC-0910", totalBOB: 390, paymentStatus: "paid" },
  { id: "s14", clientId: "8", date: "2026-06-01", invoiceNumber: "FAC-1050", totalBOB: 470, paymentStatus: "paid" },
  { id: "s15", clientId: "9", date: "2026-05-02", invoiceNumber: "FAC-0995", totalBOB: 1100, paymentStatus: "partial" },
  { id: "s16", clientId: "9", date: "2026-06-10", invoiceNumber: "FAC-1040", totalBOB: 850, paymentStatus: "pending" },
  { id: "s17", clientId: "10", date: "2026-04-25", invoiceNumber: "FAC-0970", totalBOB: 730, paymentStatus: "paid" },
  { id: "s18", clientId: "10", date: "2026-06-05", invoiceNumber: "FAC-1052", totalBOB: 410, paymentStatus: "paid" },
];
