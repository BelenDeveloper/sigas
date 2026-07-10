import type { PaymentMethod } from "@/lib/payment-method";

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCostBOB: number;
}

export interface PurchasePayment {
  id: string;
  date: string;
  amountBOB: number;
  method: PaymentMethod;
  accountDestination: string;
}

export interface Purchase {
  id: string;
  code: string;
  date: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  notes: string;
  items: PurchaseItem[];
  payments: PurchasePayment[];
}

export const MOCK_PURCHASES: Purchase[] = [
  {
    id: "1",
    code: "COM-0001",
    date: "2026-05-03",
    supplierId: "1",
    supplierName: "Ferretería Central S.R.L.",
    invoiceNumber: "F-4521",
    notes: "Reposición mensual de tuberías PVC.",
    items: [
      { id: "pi1", productId: "1", productName: 'Tubería PVC 1/2" x 6m', quantity: 100, unitCostBOB: 12.5 },
      { id: "pi2", productId: "6", productName: 'Codo PVC 1/2"', quantity: 200, unitCostBOB: 2.2 },
    ],
    payments: [
      { id: "pp1", date: "2026-05-03", amountBOB: 1690, method: "bank_transfer", accountDestination: "Banco Unión 4400-1122" },
    ],
  },
  {
    id: "2",
    code: "COM-0002",
    date: "2026-05-06",
    supplierId: "2",
    supplierName: "Importadora Boliviana de Gas S.A.",
    invoiceNumber: "F-1187",
    notes: "",
    items: [
      { id: "pi3", productId: "10", productName: "Regulador de presión doméstico", quantity: 20, unitCostBOB: 95 },
    ],
    payments: [
      { id: "pp2", date: "2026-05-06", amountBOB: 1900, method: "bank_transfer", accountDestination: "Banco Unión 4400-1122" },
    ],
  },
  {
    id: "3",
    code: "COM-0003",
    date: "2026-05-09",
    supplierId: "3",
    supplierName: "Distribuidora Andina Ltda.",
    invoiceNumber: "F-0765",
    notes: "Herramientas para cuadrillas de instalación.",
    items: [
      { id: "pi4", productId: "12", productName: 'Llave de tubo 14"', quantity: 8, unitCostBOB: 65 },
      { id: "pi5", productId: "14", productName: "Manómetro de presión", quantity: 10, unitCostBOB: 75 },
    ],
    payments: [
      { id: "pp3", date: "2026-05-09", amountBOB: 500, method: "cash", accountDestination: "Caja principal" },
    ],
  },
  {
    id: "4",
    code: "COM-0004",
    date: "2026-05-12",
    supplierId: "4",
    supplierName: "Aceros del Sur S.A.",
    invoiceNumber: "",
    notes: "Esperando factura del proveedor.",
    items: [
      { id: "pi6", productId: "9", productName: "Válvula de seguridad", quantity: 15, unitCostBOB: 85 },
    ],
    payments: [],
  },
  {
    id: "5",
    code: "COM-0005",
    date: "2026-05-15",
    supplierId: "5",
    supplierName: "Metalúrgica del Plata S.A.",
    invoiceNumber: "A-2298",
    notes: "Importación de tuberías de cobre.",
    items: [
      { id: "pi7", productId: "3", productName: 'Tubería de cobre 1/2" x 6m', quantity: 40, unitCostBOB: 68 },
    ],
    payments: [
      { id: "pp4", date: "2026-05-15", amountBOB: 2720, method: "bank_transfer", accountDestination: "Banco Unión USD 4400-9987" },
    ],
  },
  {
    id: "6",
    code: "COM-0006",
    date: "2026-05-18",
    supplierId: "6",
    supplierName: "Gasnor Insumos S.R.L.",
    invoiceNumber: "A-1076",
    notes: "",
    items: [
      { id: "pi8", productId: "11", productName: "Regulador industrial de alta presión", quantity: 6, unitCostBOB: 320 },
    ],
    payments: [
      { id: "pp5", date: "2026-05-18", amountBOB: 1000, method: "bank_transfer", accountDestination: "Banco Unión USD 4400-9987" },
    ],
  },
  {
    id: "7",
    code: "COM-0007",
    date: "2026-05-21",
    supplierId: "1",
    supplierName: "Ferretería Central S.R.L.",
    invoiceNumber: "F-4589",
    notes: "",
    items: [
      { id: "pi9", productId: "7", productName: 'Unión universal 1/2"', quantity: 100, unitCostBOB: 8 },
      { id: "pi10", productId: "8", productName: 'Válvula de bola 1/2"', quantity: 30, unitCostBOB: 22 },
    ],
    payments: [],
  },
  {
    id: "8",
    code: "COM-0008",
    date: "2026-05-24",
    supplierId: "2",
    supplierName: "Importadora Boliviana de Gas S.A.",
    invoiceNumber: "F-1203",
    notes: "",
    items: [
      { id: "pi11", productId: "13", productName: "Detector de fugas de gas", quantity: 5, unitCostBOB: 180 },
    ],
    payments: [
      { id: "pp6", date: "2026-05-24", amountBOB: 900, method: "qr", accountDestination: "QR SIGAS Simple" },
    ],
  },
  {
    id: "9",
    code: "COM-0009",
    date: "2026-05-27",
    supplierId: "3",
    supplierName: "Distribuidora Andina Ltda.",
    invoiceNumber: "",
    notes: "Pendiente de recepción en almacén.",
    items: [
      { id: "pi12", productId: "4", productName: "Tubería de polietileno 20mm", quantity: 300, unitCostBOB: 6.5 },
    ],
    payments: [],
  },
  {
    id: "10",
    code: "COM-0010",
    date: "2026-05-30",
    supplierId: "5",
    supplierName: "Metalúrgica del Plata S.A.",
    invoiceNumber: "A-2340",
    notes: "",
    items: [
      { id: "pi13", productId: "15", productName: "Extintor PQS 5kg", quantity: 10, unitCostBOB: 210 },
    ],
    payments: [
      { id: "pp7", date: "2026-05-30", amountBOB: 1200, method: "bank_transfer", accountDestination: "Banco Unión USD 4400-9987" },
    ],
  },
];
