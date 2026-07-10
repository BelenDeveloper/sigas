export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
}

export const MOCK_CATEGORIES: Category[] = [
  { id: "tuberias", name: "Tuberías" },
  { id: "accesorios", name: "Accesorios" },
  { id: "herramientas", name: "Herramientas" },
];

export const MOCK_SUBCATEGORIES: Subcategory[] = [
  { id: "tuberias-pvc", categoryId: "tuberias", name: "PVC" },
  { id: "tuberias-cobre", categoryId: "tuberias", name: "Cobre" },
  { id: "tuberias-polietileno", categoryId: "tuberias", name: "Polietileno" },
  { id: "accesorios-conexiones", categoryId: "accesorios", name: "Conexiones" },
  { id: "accesorios-valvulas", categoryId: "accesorios", name: "Válvulas" },
  { id: "accesorios-reguladores", categoryId: "accesorios", name: "Reguladores" },
  { id: "herramientas-manuales", categoryId: "herramientas", name: "Manuales" },
  { id: "herramientas-medicion", categoryId: "herramientas", name: "Medición" },
  { id: "herramientas-seguridad", categoryId: "herramientas", name: "Seguridad" },
];

export type ProductUnit = "unit" | "meter" | "kg" | "liter" | "set";

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  unit: "Unidad",
  meter: "Metro",
  kg: "Kilogramo",
  liter: "Litro",
  set: "Set",
};

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  unit: ProductUnit;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  costPriceBOB: number;
  salePriceBOB: number;
  location: string;
  netWeightKg: number;
  grossWeightKg: number;
  description: string;
  isActive: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    sku: "TUB-PVC-001",
    name: 'Tubería PVC 1/2" x 6m',
    categoryId: "tuberias",
    subcategoryId: "tuberias-pvc",
    unit: "meter",
    currentStock: 120,
    minimumStock: 40,
    maximumStock: 300,
    costPriceBOB: 12.5,
    salePriceBOB: 18,
    location: "A-01",
    netWeightKg: 0.4,
    grossWeightKg: 0.45,
    description: 'Tubería de PVC presión 1/2 pulgada, tramo de 6 metros.',
    isActive: true,
  },
  {
    id: "2",
    sku: "TUB-PVC-002",
    name: 'Tubería PVC 3/4" x 6m',
    categoryId: "tuberias",
    subcategoryId: "tuberias-pvc",
    unit: "meter",
    currentStock: 18,
    minimumStock: 30,
    maximumStock: 250,
    costPriceBOB: 16,
    salePriceBOB: 23,
    location: "A-02",
    netWeightKg: 0.6,
    grossWeightKg: 0.65,
    description: 'Tubería de PVC presión 3/4 pulgada, tramo de 6 metros.',
    isActive: true,
  },
  {
    id: "3",
    sku: "TUB-COB-001",
    name: 'Tubería de cobre 1/2" x 6m',
    categoryId: "tuberias",
    subcategoryId: "tuberias-cobre",
    unit: "meter",
    currentStock: 25,
    minimumStock: 15,
    maximumStock: 100,
    costPriceBOB: 68,
    salePriceBOB: 95,
    location: "A-05",
    netWeightKg: 1.2,
    grossWeightKg: 1.3,
    description: "Tubería de cobre rígido tipo L, tramo de 6 metros.",
    isActive: true,
  },
  {
    id: "4",
    sku: "TUB-PEL-001",
    name: "Tubería de polietileno 20mm",
    categoryId: "tuberias",
    subcategoryId: "tuberias-polietileno",
    unit: "meter",
    currentStock: 200,
    minimumStock: 50,
    maximumStock: 500,
    costPriceBOB: 6.5,
    salePriceBOB: 9.5,
    location: "A-08",
    netWeightKg: 0.15,
    grossWeightKg: 0.18,
    description: "Tubería de polietileno de alta densidad para gas, 20mm.",
    isActive: true,
  },
  {
    id: "5",
    sku: "TUB-PEL-002",
    name: "Tubería de polietileno 32mm",
    categoryId: "tuberias",
    subcategoryId: "tuberias-polietileno",
    unit: "meter",
    currentStock: 8,
    minimumStock: 20,
    maximumStock: 300,
    costPriceBOB: 9.8,
    salePriceBOB: 14,
    location: "A-09",
    netWeightKg: 0.25,
    grossWeightKg: 0.28,
    description: "Tubería de polietileno de alta densidad para gas, 32mm.",
    isActive: true,
  },
  {
    id: "6",
    sku: "ACC-CON-001",
    name: 'Codo PVC 1/2"',
    categoryId: "accesorios",
    subcategoryId: "accesorios-conexiones",
    unit: "unit",
    currentStock: 340,
    minimumStock: 100,
    maximumStock: 1000,
    costPriceBOB: 2.2,
    salePriceBOB: 3.5,
    location: "B-01",
    netWeightKg: 0.03,
    grossWeightKg: 0.03,
    description: 'Codo de PVC 90 grados, 1/2 pulgada.',
    isActive: true,
  },
  {
    id: "7",
    sku: "ACC-CON-002",
    name: 'Unión universal 1/2"',
    categoryId: "accesorios",
    subcategoryId: "accesorios-conexiones",
    unit: "unit",
    currentStock: 45,
    minimumStock: 50,
    maximumStock: 400,
    costPriceBOB: 8,
    salePriceBOB: 13,
    location: "B-02",
    netWeightKg: 0.08,
    grossWeightKg: 0.09,
    description: 'Unión universal roscada de 1/2 pulgada.',
    isActive: true,
  },
  {
    id: "8",
    sku: "ACC-VAL-001",
    name: 'Válvula de bola 1/2"',
    categoryId: "accesorios",
    subcategoryId: "accesorios-valvulas",
    unit: "unit",
    currentStock: 60,
    minimumStock: 25,
    maximumStock: 200,
    costPriceBOB: 22,
    salePriceBOB: 35,
    location: "B-05",
    netWeightKg: 0.2,
    grossWeightKg: 0.22,
    description: 'Válvula de bola de paso total, 1/2 pulgada, para gas.',
    isActive: true,
  },
  {
    id: "9",
    sku: "ACC-VAL-002",
    name: "Válvula de seguridad",
    categoryId: "accesorios",
    subcategoryId: "accesorios-valvulas",
    unit: "unit",
    currentStock: 9,
    minimumStock: 12,
    maximumStock: 80,
    costPriceBOB: 85,
    salePriceBOB: 130,
    location: "B-06",
    netWeightKg: 0.35,
    grossWeightKg: 0.4,
    description: "Válvula de alivio de seguridad para instalaciones de gas.",
    isActive: true,
  },
  {
    id: "10",
    sku: "ACC-REG-001",
    name: "Regulador de presión doméstico",
    categoryId: "accesorios",
    subcategoryId: "accesorios-reguladores",
    unit: "unit",
    currentStock: 55,
    minimumStock: 20,
    maximumStock: 150,
    costPriceBOB: 95,
    salePriceBOB: 145,
    location: "B-09",
    netWeightKg: 0.5,
    grossWeightKg: 0.55,
    description: "Regulador de baja presión para uso doméstico.",
    isActive: true,
  },
  {
    id: "11",
    sku: "ACC-REG-002",
    name: "Regulador industrial de alta presión",
    categoryId: "accesorios",
    subcategoryId: "accesorios-reguladores",
    unit: "unit",
    currentStock: 4,
    minimumStock: 8,
    maximumStock: 40,
    costPriceBOB: 320,
    salePriceBOB: 480,
    location: "B-10",
    netWeightKg: 1.8,
    grossWeightKg: 2,
    description: "Regulador de alta presión para instalaciones industriales.",
    isActive: true,
  },
  {
    id: "12",
    sku: "HER-MAN-001",
    name: 'Llave de tubo 14"',
    categoryId: "herramientas",
    subcategoryId: "herramientas-manuales",
    unit: "unit",
    currentStock: 14,
    minimumStock: 5,
    maximumStock: 40,
    costPriceBOB: 65,
    salePriceBOB: 98,
    location: "C-01",
    netWeightKg: 1.1,
    grossWeightKg: 1.2,
    description: 'Llave de tubo tipo stillson, 14 pulgadas.',
    isActive: true,
  },
  {
    id: "13",
    sku: "HER-MED-001",
    name: "Detector de fugas de gas",
    categoryId: "herramientas",
    subcategoryId: "herramientas-medicion",
    unit: "unit",
    currentStock: 3,
    minimumStock: 6,
    maximumStock: 30,
    costPriceBOB: 180,
    salePriceBOB: 260,
    location: "C-04",
    netWeightKg: 0.3,
    grossWeightKg: 0.35,
    description: "Detector electrónico portátil de fugas de gas natural.",
    isActive: true,
  },
  {
    id: "14",
    sku: "HER-MED-002",
    name: "Manómetro de presión",
    categoryId: "herramientas",
    subcategoryId: "herramientas-medicion",
    unit: "unit",
    currentStock: 20,
    minimumStock: 8,
    maximumStock: 60,
    costPriceBOB: 75,
    salePriceBOB: 115,
    location: "C-05",
    netWeightKg: 0.25,
    grossWeightKg: 0.3,
    description: "Manómetro analógico para medición de presión de gas.",
    isActive: false,
  },
  {
    id: "15",
    sku: "HER-SEG-001",
    name: "Extintor PQS 5kg",
    categoryId: "herramientas",
    subcategoryId: "herramientas-seguridad",
    unit: "unit",
    currentStock: 12,
    minimumStock: 10,
    maximumStock: 50,
    costPriceBOB: 210,
    salePriceBOB: 290,
    location: "C-08",
    netWeightKg: 5,
    grossWeightKg: 5.8,
    description: "Extintor de polvo químico seco, 5 kilogramos.",
    isActive: false,
  },
];

export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  createdBy: string;
}

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  { id: "m1", date: "2026-06-02", productId: "1", type: "IN", quantity: 100, stockBefore: 40, stockAfter: 140, reason: "Compra a proveedor Plastiforte", createdBy: "Harold" },
  { id: "m2", date: "2026-06-03", productId: "6", type: "IN", quantity: 200, stockBefore: 220, stockAfter: 420, reason: "Compra a proveedor Plastiforte", createdBy: "Harold" },
  { id: "m3", date: "2026-06-04", productId: "1", type: "OUT", quantity: -20, stockBefore: 140, stockAfter: 120, reason: "Instalación Ed. Torres del Sol", createdBy: "Mirael" },
  { id: "m4", date: "2026-06-05", productId: "8", type: "OUT", quantity: -8, stockBefore: 68, stockAfter: 60, reason: "Instalación domiciliaria Urb. Las Palmas", createdBy: "Mirael" },
  { id: "m5", date: "2026-06-07", productId: "3", type: "IN", quantity: 30, stockBefore: 0, stockAfter: 30, reason: "Compra a proveedor Cobrecen", createdBy: "Harold" },
  { id: "m6", date: "2026-06-08", productId: "3", type: "OUT", quantity: -5, stockBefore: 30, stockAfter: 25, reason: "Mantenimiento planta Hotel Real", createdBy: "Mirael" },
  { id: "m7", date: "2026-06-10", productId: "9", type: "ADJUSTMENT", quantity: -2, stockBefore: 11, stockAfter: 9, reason: "Corrección por conteo físico", createdBy: "Harold" },
  { id: "m8", date: "2026-06-11", productId: "2", type: "OUT", quantity: -12, stockBefore: 30, stockAfter: 18, reason: "Ampliación de red Zona Norte", createdBy: "Mirael" },
  { id: "m9", date: "2026-06-12", productId: "4", type: "IN", quantity: 150, stockBefore: 50, stockAfter: 200, reason: "Compra a proveedor Polired", createdBy: "Harold" },
  { id: "m10", date: "2026-06-14", productId: "5", type: "OUT", quantity: -12, stockBefore: 20, stockAfter: 8, reason: "Instalación red Cond. Los Sauces", createdBy: "Mirael" },
  { id: "m11", date: "2026-06-15", productId: "7", type: "IN", quantity: 60, stockBefore: 0, stockAfter: 60, reason: "Compra a proveedor Plastiforte", createdBy: "Harold" },
  { id: "m12", date: "2026-06-16", productId: "7", type: "OUT", quantity: -15, stockBefore: 60, stockAfter: 45, reason: "Instalación industrial Frigorífico San José", createdBy: "Mirael" },
  { id: "m13", date: "2026-06-18", productId: "10", type: "IN", quantity: 40, stockBefore: 15, stockAfter: 55, reason: "Compra a proveedor Reguval", createdBy: "Harold" },
  { id: "m14", date: "2026-06-19", productId: "11", type: "OUT", quantity: -6, stockBefore: 10, stockAfter: 4, reason: "Instalación industrial Frigorífico San José", createdBy: "Mirael" },
  { id: "m15", date: "2026-06-20", productId: "12", type: "ADJUSTMENT", quantity: 2, stockBefore: 12, stockAfter: 14, reason: "Corrección por conteo físico", createdBy: "Harold" },
  { id: "m16", date: "2026-06-22", productId: "13", type: "IN", quantity: 10, stockBefore: 0, stockAfter: 10, reason: "Compra a proveedor SegurGas", createdBy: "Harold" },
  { id: "m17", date: "2026-06-24", productId: "13", type: "OUT", quantity: -7, stockBefore: 10, stockAfter: 3, reason: "Distribución a cuadrillas de instalación", createdBy: "Mirael" },
  { id: "m18", date: "2026-06-25", productId: "14", type: "IN", quantity: 25, stockBefore: 0, stockAfter: 25, reason: "Compra a proveedor SegurGas", createdBy: "Harold" },
  { id: "m19", date: "2026-06-27", productId: "14", type: "OUT", quantity: -5, stockBefore: 25, stockAfter: 20, reason: "Distribución a cuadrillas de instalación", createdBy: "Mirael" },
  { id: "m20", date: "2026-06-28", productId: "15", type: "ADJUSTMENT", quantity: -3, stockBefore: 15, stockAfter: 12, reason: "Corrección por conteo físico", createdBy: "Harold" },
];
