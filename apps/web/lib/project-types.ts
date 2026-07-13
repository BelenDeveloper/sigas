export const PROJECT_CATEGORIES = ["domestic", "commercial", "industrial"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  domestic: "Domiciliario",
  commercial: "Comercial",
  industrial: "Industrial",
};
