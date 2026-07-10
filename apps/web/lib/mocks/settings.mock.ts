export interface CompanyInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  email: string;
  logoFileName: string;
}

export const MOCK_COMPANY_INFO: CompanyInfo = {
  name: "SIGAS Thermofusion Bolivia",
  phone: "+591 4 4123456",
  address: "Av. Blanco Galindo km 5, Zona Industrial",
  city: "Cochabamba",
  email: "contacto@sigasthermofusion.com.bo",
  logoFileName: "",
};

export interface SettingsCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface SettingsSubcategory {
  id: string;
  categoryId: string;
  name: string;
  isActive: boolean;
}

export const MOCK_SETTINGS_CATEGORIES: SettingsCategory[] = [
  { id: "tuberias", name: "Tuberías", isActive: true },
  { id: "accesorios", name: "Accesorios", isActive: true },
  { id: "herramientas", name: "Herramientas", isActive: true },
];

export const MOCK_SETTINGS_SUBCATEGORIES: SettingsSubcategory[] = [
  { id: "tuberias-pvc", categoryId: "tuberias", name: "PVC", isActive: true },
  { id: "tuberias-cobre", categoryId: "tuberias", name: "Cobre", isActive: true },
  { id: "tuberias-polietileno", categoryId: "tuberias", name: "Polietileno", isActive: true },
  { id: "accesorios-conexiones", categoryId: "accesorios", name: "Conexiones", isActive: true },
  { id: "accesorios-valvulas", categoryId: "accesorios", name: "Válvulas", isActive: true },
  { id: "accesorios-reguladores", categoryId: "accesorios", name: "Reguladores", isActive: true },
  { id: "herramientas-manuales", categoryId: "herramientas", name: "Manuales", isActive: true },
  { id: "herramientas-medicion", categoryId: "herramientas", name: "Medición", isActive: true },
  { id: "herramientas-seguridad", categoryId: "herramientas", name: "Seguridad", isActive: true },
];
