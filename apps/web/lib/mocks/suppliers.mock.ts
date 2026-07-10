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

export const DEFAULT_SUPPLIER_COUNTRY = "Bolivia";

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "1",
    companyName: "Ferretería Central S.R.L.",
    contactName: "Marcelo Quispe Ticona",
    nit: "1023874019",
    phone: "22456789",
    email: "ventas@ferreteriacentral.com.bo",
    address: "Av. Buenos Aires 1240",
    city: "La Paz",
    country: "Bolivia",
    notes: "Proveedor principal de tuberías PVC y accesorios de conexión.",
    isActive: true,
  },
  {
    id: "2",
    companyName: "Importadora Boliviana de Gas S.A.",
    contactName: "Daniela Rocha Vaca",
    nit: "1087654302",
    phone: "33345678",
    email: "contacto@ibgas.com.bo",
    address: "3er Anillo Interno, Av. Cristo Redentor",
    city: "Santa Cruz",
    country: "Bolivia",
    notes: "Importa reguladores y válvulas de seguridad certificadas.",
    isActive: true,
  },
  {
    id: "3",
    companyName: "Distribuidora Andina Ltda.",
    contactName: "Wilson Mamani Choque",
    nit: "1054321098",
    phone: "44567890",
    email: "pedidos@distandina.com.bo",
    address: "Calle Ayacucho 560",
    city: "Cochabamba",
    country: "Bolivia",
    notes: "Herramientas y equipos de medición.",
    isActive: true,
  },
  {
    id: "4",
    companyName: "Aceros del Sur S.A.",
    contactName: "Patricia Flores Condori",
    nit: "1076543210",
    phone: "22987654",
    email: "ventas@acerosdelsur.com.bo",
    address: "Zona Industrial, Calle 4",
    city: "El Alto",
    country: "Bolivia",
    notes: "Ya no trabaja con nosotros de forma regular.",
    isActive: false,
  },
  {
    id: "5",
    companyName: "Metalúrgica del Plata S.A.",
    contactName: "Martín Fernández Sosa",
    nit: "30-71234567-9",
    phone: "+54 11 4567 8900",
    email: "comercial@metalurgicaplata.com.ar",
    address: "Av. Corrientes 2340",
    city: "Buenos Aires",
    country: "Argentina",
    notes: "Fabricante de tuberías de cobre y bronce importadas.",
    isActive: true,
  },
  {
    id: "6",
    companyName: "Gasnor Insumos S.R.L.",
    contactName: "Lucía Beatriz Romero",
    nit: "30-65432198-3",
    phone: "+54 387 421 5566",
    email: "info@gasnorinsumos.com.ar",
    address: "Ruta 9 Km 1145",
    city: "Salta",
    country: "Argentina",
    notes: "Proveedor de reguladores industriales de alta presión.",
    isActive: true,
  },
];
