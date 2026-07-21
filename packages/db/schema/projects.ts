import { boolean, date, index, integer, numeric, pgSequence, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { companies } from "./companies.js";
import { PAYMENT_METHODS } from "./sales.js";
import { users } from "./users.js";

export const PROJECT_CATEGORIES = ["domestic", "commercial", "industrial"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

// Order matters: it defines the allowed forward-only progression for changeStage().
// "cancelled" is a special case reachable from any other stage.
export const PROJECT_STAGES = [
  "quotation",
  "contract",
  "design",
  "design_inspection",
  "first_payment",
  "material_purchase",
  "installation",
  "technician_payment",
  "hermeticity",
  "final_hermeticity",
  "acometida",
  "completed",
  "cancelled",
] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const CHECKLIST_CHANNELS = ["correo", "ventanilla", "inspector"] as const;
export type ChecklistChannel = (typeof CHECKLIST_CHANNELS)[number];

export const PROJECT_CODE_SEQUENCE_NAME = "project_code_seq";

export const projectCodeSeq = pgSequence(PROJECT_CODE_SEQUENCE_NAME, {
  startWith: 1,
  increment: 1,
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    category: text("category", { enum: PROJECT_CATEGORIES }).notNull(),
    companyId: uuid("company_id").references(() => companies.id),
    clientName: text("client_name"),
    clientPhone: text("client_phone"),
    clientAddress: text("client_address"),
    isPrivate: boolean("is_private").notNull().default(false),
    stage: text("stage", { enum: PROJECT_STAGES }).notNull().default("quotation"),
    description: text("description"),
    totalValue: numeric("total_value", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("BOB"),
    firstPaymentAmount: numeric("first_payment_amount", { precision: 12, scale: 2 }),
    secondPaymentAmount: numeric("second_payment_amount", { precision: 12, scale: 2 }),
    startDate: date("start_date"),
    estimatedEnd: date("estimated_end"),
    endDate: date("end_date"),
    cancellationReason: text("cancellation_reason"),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("projects_company_id_idx").on(table.companyId),
    index("projects_stage_idx").on(table.stage),
    index("projects_category_idx").on(table.category),
  ],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const projectStageHistory = pgTable(
  "project_stage_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    stage: text("stage", { enum: PROJECT_STAGES }).notNull(),
    changedBy: uuid("changed_by")
      .notNull()
      .references(() => users.id),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
    notes: text("notes"),
  },
  (table) => [index("project_stage_history_project_id_idx").on(table.projectId)],
);

export type ProjectStageHistory = typeof projectStageHistory.$inferSelect;
export type NewProjectStageHistory = typeof projectStageHistory.$inferInsert;

export const projectLogistics = pgTable("project_logistics", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id),
  assignedLogisticsUser: uuid("assigned_logistics_user").references(() => users.id),
  logisticsNotes: text("logistics_notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProjectLogistics = typeof projectLogistics.$inferSelect;
export type NewProjectLogistics = typeof projectLogistics.$inferInsert;

export const projectLogisticsTasks = pgTable(
  "project_logistics_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    stage: text("stage", { enum: PROJECT_STAGES }).notNull(),
    description: text("description").notNull(),
    assignedTo: uuid("assigned_to").references(() => users.id),
    isCompleted: boolean("is_completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedBy: uuid("completed_by").references(() => users.id),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("project_logistics_tasks_project_id_idx").on(table.projectId)],
);

export type ProjectLogisticsTask = typeof projectLogisticsTasks.$inferSelect;
export type NewProjectLogisticsTask = typeof projectLogisticsTasks.$inferInsert;

export const projectDocuments = pgTable(
  "project_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    stage: text("stage", { enum: PROJECT_STAGES }),
    name: text("name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type"),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("project_documents_project_id_idx").on(table.projectId)],
);

export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type NewProjectDocument = typeof projectDocuments.$inferInsert;

export const projectExpenses = pgTable(
  "project_expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    stage: text("stage", { enum: PROJECT_STAGES }),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
    receiptUrl: text("receipt_url"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("project_expenses_project_id_idx").on(table.projectId)],
);

export type ProjectExpense = typeof projectExpenses.$inferSelect;
export type NewProjectExpense = typeof projectExpenses.$inferInsert;

export const projectPaymentsReceived = pgTable(
  "project_payments_received",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    paymentNumber: integer("payment_number").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
    accountDestination: text("account_destination"),
    receiptUrl: text("receipt_url"),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => [index("project_payments_received_project_id_idx").on(table.projectId)],
);

export type ProjectPaymentReceived = typeof projectPaymentsReceived.$inferSelect;
export type NewProjectPaymentReceived = typeof projectPaymentsReceived.$inferInsert;

export const projectApprovalChecklist = pgTable(
  "project_approval_checklist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    stepNumber: integer("step_number").notNull(),
    stepDescription: text("step_description").notNull(),
    channel: text("channel", { enum: CHECKLIST_CHANNELS }),
    sortOrder: integer("sort_order").notNull().default(0),
    isCompleted: boolean("is_completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedBy: uuid("completed_by").references(() => users.id),
    notes: text("notes"),
  },
  (table) => [index("project_approval_checklist_project_id_idx").on(table.projectId)],
);

export type ProjectApprovalChecklist = typeof projectApprovalChecklist.$inferSelect;
export type NewProjectApprovalChecklist = typeof projectApprovalChecklist.$inferInsert;
