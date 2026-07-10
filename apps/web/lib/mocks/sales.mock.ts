export type SaleType = "quotation" | "order" | "sale" | "return";

export const SALE_TYPE_LABELS: Record<SaleType, string> = {
  quotation: "Cotización",
  order: "Pedido",
  sale: "Venta",
  return: "Devolución",
};

export type PaymentMethod = "cash" | "qr" | "bank_transfer" | "check" | "credit_card";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  qr: "QR",
  bank_transfer: "Transferencia bancaria",
  check: "Cheque",
  credit_card: "Tarjeta de crédito",
};

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceBOB: number;
}

export interface SalePayment {
  id: string;
  date: string;
  amountBOB: number;
  method: PaymentMethod;
  accountDestination: string;
}

export interface Sale {
  id: string;
  code: string;
  date: string;
  clientId: string;
  clientName: string;
  type: SaleType;
  notes: string;
  items: SaleItem[];
  payments: SalePayment[];
}

export const MOCK_SALES: Sale[] = [
  {
    id: "1",
    code: "VTA-0001",
    date: "2026-05-02",
    clientId: "1",
    clientName: "Rodrigo Áñez Prado",
    type: "sale",
    notes: "Entrega en obra, coordinar con el cliente.",
    items: [
      { id: "i1", productId: "1", productName: 'Tubería PVC 1/2" x 6m', quantity: 20, unitPriceBOB: 18 },
      { id: "i2", productId: "6", productName: 'Codo PVC 1/2"', quantity: 15, unitPriceBOB: 3.5 },
    ],
    payments: [
      { id: "p1", date: "2026-05-02", amountBOB: 412.5, method: "cash", accountDestination: "Caja principal" },
    ],
  },
  {
    id: "2",
    code: "COT-0001",
    date: "2026-05-05",
    clientId: "2",
    clientName: "María Elena Vargas Quiroga",
    type: "quotation",
    notes: "Cotización para ampliación de red domiciliaria.",
    items: [
      { id: "i3", productId: "4", productName: "Tubería de polietileno 20mm", quantity: 30, unitPriceBOB: 9.5 },
    ],
    payments: [],
  },
  {
    id: "3",
    code: "PED-0001",
    date: "2026-05-07",
    clientId: "3",
    clientName: "Juan Carlos Delgado Rocha",
    type: "order",
    notes: "Pendiente de confirmación de stock.",
    items: [
      { id: "i4", productId: "8", productName: 'Válvula de bola 1/2"', quantity: 4, unitPriceBOB: 35 },
      { id: "i5", productId: "10", productName: "Regulador de presión doméstico", quantity: 2, unitPriceBOB: 145 },
    ],
    payments: [],
  },
  {
    id: "4",
    code: "VTA-0002",
    date: "2026-05-10",
    clientId: "3",
    clientName: "Juan Carlos Delgado Rocha",
    type: "sale",
    notes: "",
    items: [
      { id: "i6", productId: "10", productName: "Regulador de presión doméstico", quantity: 1, unitPriceBOB: 145 },
    ],
    payments: [
      { id: "p2", date: "2026-05-10", amountBOB: 70, method: "qr", accountDestination: "QR SIGAS Simple" },
    ],
  },
  {
    id: "5",
    code: "VTA-0003",
    date: "2026-05-12",
    clientId: "5",
    clientName: "Pedro Antonio Gutiérrez Mamani",
    type: "sale",
    notes: "Cliente frecuente, entrega inmediata.",
    items: [
      { id: "i7", productId: "11", productName: "Regulador industrial de alta presión", quantity: 3, unitPriceBOB: 480 },
    ],
    payments: [
      { id: "p3", date: "2026-05-12", amountBOB: 1440, method: "bank_transfer", accountDestination: "Banco Unión 4400-1122" },
    ],
  },
  {
    id: "6",
    code: "DEV-0001",
    date: "2026-05-14",
    clientId: "5",
    clientName: "Pedro Antonio Gutiérrez Mamani",
    type: "return",
    notes: "Devolución por regulador defectuoso.",
    items: [
      { id: "i8", productId: "11", productName: "Regulador industrial de alta presión", quantity: 1, unitPriceBOB: 480 },
    ],
    payments: [],
  },
  {
    id: "7",
    code: "COT-0002",
    date: "2026-05-16",
    clientId: "4",
    clientName: "Ana Lucía Fernández Salazar",
    type: "quotation",
    notes: "",
    items: [
      { id: "i9", productId: "3", productName: 'Tubería de cobre 1/2" x 6m', quantity: 10, unitPriceBOB: 95 },
    ],
    payments: [],
  },
  {
    id: "8",
    code: "PED-0002",
    date: "2026-05-19",
    clientId: "6",
    clientName: "Carla Beatriz Rojas Terrazas",
    type: "order",
    notes: "Confirmar fecha de instalación con el cliente.",
    items: [
      { id: "i10", productId: "7", productName: 'Unión universal 1/2"', quantity: 12, unitPriceBOB: 13 },
      { id: "i11", productId: "6", productName: 'Codo PVC 1/2"', quantity: 8, unitPriceBOB: 3.5 },
    ],
    payments: [],
  },
  {
    id: "9",
    code: "VTA-0004",
    date: "2026-05-21",
    clientId: "7",
    clientName: "Luis Fernando Paz Coca",
    type: "sale",
    notes: "",
    items: [
      { id: "i12", productId: "9", productName: "Válvula de seguridad", quantity: 2, unitPriceBOB: 130 },
    ],
    payments: [
      { id: "p4", date: "2026-05-21", amountBOB: 150, method: "cash", accountDestination: "Caja principal" },
    ],
  },
  {
    id: "10",
    code: "VTA-0005",
    date: "2026-05-24",
    clientId: "8",
    clientName: "Gabriela Soledad Montaño Ibáñez",
    type: "sale",
    notes: "Pago contra entrega.",
    items: [
      { id: "i13", productId: "12", productName: 'Llave de tubo 14"', quantity: 1, unitPriceBOB: 98 },
      { id: "i14", productId: "13", productName: "Detector de fugas de gas", quantity: 1, unitPriceBOB: 260 },
    ],
    payments: [
      { id: "p5", date: "2026-05-24", amountBOB: 358, method: "credit_card", accountDestination: "POS Enlace 002" },
    ],
  },
  {
    id: "11",
    code: "COT-0003",
    date: "2026-05-27",
    clientId: "9",
    clientName: "Ricardo Andrés Salinas Peredo",
    type: "quotation",
    notes: "Esperando aprobación de presupuesto.",
    items: [
      { id: "i15", productId: "2", productName: 'Tubería PVC 3/4" x 6m', quantity: 25, unitPriceBOB: 23 },
    ],
    payments: [],
  },
  {
    id: "12",
    code: "VTA-0006",
    date: "2026-05-29",
    clientId: "9",
    clientName: "Ricardo Andrés Salinas Peredo",
    type: "sale",
    notes: "Aún no cancela, coordinar cobranza.",
    items: [
      { id: "i16", productId: "9", productName: "Válvula de seguridad", quantity: 1, unitPriceBOB: 130 },
      { id: "i17", productId: "14", productName: "Manómetro de presión", quantity: 1, unitPriceBOB: 115 },
    ],
    payments: [],
  },
  {
    id: "13",
    code: "PED-0003",
    date: "2026-06-01",
    clientId: "10",
    clientName: "Verónica Patricia Cardozo Villca",
    type: "order",
    notes: "",
    items: [
      { id: "i18", productId: "5", productName: "Tubería de polietileno 32mm", quantity: 40, unitPriceBOB: 14 },
    ],
    payments: [],
  },
  {
    id: "14",
    code: "VTA-0007",
    date: "2026-06-03",
    clientId: "2",
    clientName: "María Elena Vargas Quiroga",
    type: "sale",
    notes: "",
    items: [
      { id: "i19", productId: "4", productName: "Tubería de polietileno 20mm", quantity: 30, unitPriceBOB: 9.5 },
    ],
    payments: [
      { id: "p6", date: "2026-06-03", amountBOB: 285, method: "qr", accountDestination: "QR SIGAS Simple" },
    ],
  },
  {
    id: "15",
    code: "DEV-0002",
    date: "2026-06-05",
    clientId: "1",
    clientName: "Rodrigo Áñez Prado",
    type: "return",
    notes: "Devolución parcial de tubería sobrante.",
    items: [
      { id: "i20", productId: "1", productName: 'Tubería PVC 1/2" x 6m', quantity: 5, unitPriceBOB: 18 },
    ],
    payments: [],
  },
];
