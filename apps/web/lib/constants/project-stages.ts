export type ProjectStageKey =
  | "quotation"
  | "contract"
  | "design"
  | "design_inspection"
  | "first_payment"
  | "material_purchase"
  | "installation"
  | "technician_payment"
  | "hermeticity"
  | "final_hermeticity"
  | "acometida"
  | "completed"
  | "cancelled";

export interface ProjectStageDefinition {
  key: ProjectStageKey;
  label: string;
  step: number | null;
}

export const PROJECT_STAGES: ProjectStageDefinition[] = [
  { key: "quotation", label: "Cotización", step: 1 },
  { key: "contract", label: "Contrato", step: 2 },
  { key: "design", label: "Diseño", step: 3 },
  { key: "design_inspection", label: "Inspección de diseño", step: 4 },
  { key: "first_payment", label: "Primer pago", step: 5 },
  { key: "material_purchase", label: "Compra de materiales", step: 6 },
  { key: "installation", label: "Instalación", step: 7 },
  { key: "technician_payment", label: "Pago a técnico", step: 8 },
  { key: "hermeticity", label: "Hermeticidad", step: 9 },
  { key: "final_hermeticity", label: "Hermeticidad final", step: 10 },
  { key: "acometida", label: "Acometida", step: 11 },
  { key: "completed", label: "Completado", step: 12 },
  { key: "cancelled", label: "Cancelado", step: null },
];

export const CANCELLED_STAGE_KEY: ProjectStageKey = "cancelled";
export const INITIAL_STAGE_KEY: ProjectStageKey = "quotation";

export const PIPELINE_STAGES: ProjectStageDefinition[] = PROJECT_STAGES.filter(
  (stage) => stage.step !== null,
);

export function getStageByKey(key: ProjectStageKey): ProjectStageDefinition {
  const stage = PROJECT_STAGES.find((candidate) => candidate.key === key);

  if (!stage) {
    throw new Error(`Unknown project stage: ${key}`);
  }

  return stage;
}

export function getNextStage(currentKey: ProjectStageKey): ProjectStageDefinition | null {
  const currentStage = getStageByKey(currentKey);

  if (currentStage.step === null) {
    return null;
  }

  const nextStep = currentStage.step + 1;

  return PIPELINE_STAGES.find((stage) => stage.step === nextStep) ?? null;
}
