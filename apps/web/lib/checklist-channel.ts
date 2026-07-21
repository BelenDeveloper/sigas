export type ChecklistChannel = "correo" | "ventanilla" | "inspector";

export const CHECKLIST_CHANNELS: ChecklistChannel[] = ["correo", "ventanilla", "inspector"];

export const CHECKLIST_CHANNEL_LABELS: Record<ChecklistChannel, string> = {
  correo: "Correo",
  ventanilla: "Ventanilla",
  inspector: "Inspector",
};
