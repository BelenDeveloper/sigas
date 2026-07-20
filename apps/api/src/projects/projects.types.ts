import type {
  PaymentMethod,
  Project,
  ProjectApprovalChecklist,
  ProjectCategory,
  ProjectDocument,
  ProjectExpense,
  ProjectLogistics,
  ProjectLogisticsTask,
  ProjectPaymentReceived,
  ProjectStage,
  ProjectStageHistory,
} from "@repo/db";

export type {
  Project,
  ProjectApprovalChecklist,
  ProjectDocument,
  ProjectExpense,
  ProjectLogistics,
  ProjectLogisticsTask,
  ProjectPaymentReceived,
  ProjectStageHistory,
};

export interface ProjectListItem extends Project {
  companyName: string | null;
}

export interface ProjectDetail extends Project {
  companyName: string | null;
  logistics: ProjectLogistics | null;
  logisticsTasks: ProjectLogisticsTask[];
  documents: ProjectDocument[];
  expenses: ProjectExpense[];
  paymentsReceived: ProjectPaymentReceived[];
  checklist: ProjectApprovalChecklist[];
  stageHistory: ProjectStageHistory[];
}

export interface ProjectSummary {
  totalValue: number;
  totalCollected: number;
  totalExpenses: number;
  grossMargin: number;
}

export interface ProjectFilters {
  companyId?: string;
  category?: ProjectCategory;
  stage?: ProjectStage;
  userId: string;
}

export interface CreateProjectInput {
  name: string;
  category: ProjectCategory;
  companyId?: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  isPrivate?: boolean;
  description?: string;
  totalValue?: number;
  currency?: string;
  firstPaymentAmount?: number;
  secondPaymentAmount?: number;
  startDate?: string;
  estimatedEnd?: string;
  notes?: string;
}

export interface UpdateProjectInput {
  name: string;
  category: ProjectCategory;
  companyId?: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  isPrivate: boolean;
  description?: string;
  totalValue?: number;
  currency?: string;
  firstPaymentAmount?: number;
  secondPaymentAmount?: number;
  startDate?: string;
  estimatedEnd?: string;
  notes?: string;
}

export interface ChangeStageInput {
  newStage: ProjectStage;
  notes?: string;
}

export interface AddLogisticsTaskInput {
  projectId: string;
  stage: ProjectStage;
  description: string;
  assignedTo?: string;
}

export interface UploadDocumentInput {
  projectId: string;
  stage?: ProjectStage;
  name: string;
  fileUrl: string;
  fileType?: string;
}

export interface AddExpenseInput {
  projectId: string;
  stage?: ProjectStage;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
}

export interface RecordPaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  accountDestination: string;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateChecklistInput {
  isCompleted: boolean;
  notes?: string;
}

export interface GetUploadUrlInput {
  projectId: string;
  fileName: string;
  contentType: string;
}

export interface SignedUploadUrl {
  signedUrl: string;
  path: string;
  token: string;
}

export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project not found: ${projectId}`);
    this.name = "ProjectNotFoundError";
  }
}

export class PrivateProjectAccessDeniedError extends Error {
  constructor(projectId: string) {
    super(`You do not have access to private project: ${projectId}`);
    this.name = "PrivateProjectAccessDeniedError";
  }
}

export class InvalidStageTransitionError extends Error {
  constructor(from: ProjectStage, to: ProjectStage) {
    super(`Cannot move project from stage "${from}" to "${to}"`);
    this.name = "InvalidStageTransitionError";
  }
}

export class CancellationReasonRequiredError extends Error {
  constructor() {
    super("A reason is required to cancel a project");
    this.name = "CancellationReasonRequiredError";
  }
}

export class LogisticsTaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Logistics task not found: ${taskId}`);
    this.name = "LogisticsTaskNotFoundError";
  }
}

export class ChecklistItemNotFoundError extends Error {
  constructor(checklistItemId: string) {
    super(`Approval checklist item not found: ${checklistItemId}`);
    this.name = "ChecklistItemNotFoundError";
  }
}

