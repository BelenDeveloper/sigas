import { Injectable } from "@nestjs/common";
import { db, schema, PROJECT_STAGES, type ChecklistChannel, type Project, type ProjectStage } from "@repo/db";
import { and, desc, eq, getTableColumns, or, sql } from "drizzle-orm";

import { CashService } from "../cash/cash.service.js";
import { SupabaseAdminService } from "../supabase/supabase.service.js";
import {
  CancellationReasonRequiredError,
  ChecklistItemNotFoundError,
  InvalidStageTransitionError,
  LogisticsTaskNotFoundError,
  PrivateProjectAccessDeniedError,
  ProjectNotFoundError,
  type AddExpenseInput,
  type AddLogisticsTaskInput,
  type ChangeStageInput,
  type CreateProjectInput,
  type GetUploadUrlInput,
  type ProjectApprovalChecklist,
  type ProjectDetail,
  type ProjectDocument,
  type ProjectExpense,
  type ProjectFilters,
  type ProjectListItem,
  type ProjectLogisticsTask,
  type ProjectPaymentReceived,
  type ProjectSummary,
  type RecordPaymentInput,
  type SignedUploadUrl,
  type UpdateChecklistInput,
  type UpdateProjectInput,
  type UploadDocumentInput,
} from "./projects.types.js";

const PROJECT_CODE_PREFIX = "PROJ";
const PROJECT_CODE_PADDING_LENGTH = 4;
const PROJECT_FILES_BUCKET = "project-files";
const ADMIN_ROLE = "admin";
const CASH_PAYMENT_METHOD = "cash";
const DEFAULT_CASH_DESTINATION = "Efectivo caja";

// The design_inspection approval workflow — matches the checklist already defined in the
// frontend (apps/web/lib/constants/project-stages.ts, APPROVAL_CHECKLIST_STEPS).
const DEFAULT_CHECKLIST_STEPS: { description: string; channel: ChecklistChannel }[] = [
  { description: "Enviar KMZ a YPFB", channel: "correo" },
  { description: "Recibir aprobación de diseño", channel: "correo" },
  { description: "Firmar carta de inicio", channel: "ventanilla" },
  { description: "Inspeccionar con el inspector municipal", channel: "inspector" },
  { description: "Obtener el sello final", channel: "ventanilla" },
];

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class ProjectsService {
  private readonly cashService = new CashService();
  private readonly supabaseAdminService = new SupabaseAdminService();

  async findAll(filters: ProjectFilters): Promise<ProjectListItem[]> {
    const conditions = [];

    if (filters.companyId) {
      conditions.push(eq(schema.projects.companyId, filters.companyId));
    }

    if (filters.category) {
      conditions.push(eq(schema.projects.category, filters.category));
    }

    if (filters.stage) {
      conditions.push(eq(schema.projects.stage, filters.stage));
    }

    if (!(await this.isAdmin(filters.userId))) {
      conditions.push(
        or(eq(schema.projects.isPrivate, false), eq(schema.projects.createdBy, filters.userId)),
      );
    }

    const query = db
      .select({
        ...getTableColumns(schema.projects),
        companyName: schema.companies.name,
      })
      .from(schema.projects)
      .leftJoin(schema.companies, eq(schema.projects.companyId, schema.companies.id))
      .orderBy(desc(schema.projects.createdAt));

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  }

  async findById(id: string, userId: string): Promise<ProjectDetail> {
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);

    if (!project) {
      throw new ProjectNotFoundError(id);
    }

    if (project.isPrivate && project.createdBy !== userId && !(await this.isAdmin(userId))) {
      throw new PrivateProjectAccessDeniedError(id);
    }

    return this.buildProjectDetail(project);
  }

  async create(input: CreateProjectInput, userId: string): Promise<Project> {
    const code = await this.generateNextCode();

    return db.transaction(async (tx) => {
      const [project] = await tx
        .insert(schema.projects)
        .values({
          code,
          name: input.name,
          category: input.category,
          companyId: input.companyId,
          clientName: input.clientName,
          clientPhone: input.clientPhone,
          clientAddress: input.clientAddress,
          isPrivate: input.isPrivate ?? false,
          description: input.description,
          totalValue: input.totalValue?.toString(),
          currency: input.currency,
          firstPaymentAmount: input.firstPaymentAmount?.toString(),
          secondPaymentAmount: input.secondPaymentAmount?.toString(),
          startDate: input.startDate,
          estimatedEnd: input.estimatedEnd,
          notes: input.notes,
          createdBy: userId,
        })
        .returning();

      if (!project) {
        throw new Error(`Failed to create project: ${input.name}`);
      }

      await tx.insert(schema.projectLogistics).values({ projectId: project.id });

      await tx.insert(schema.projectStageHistory).values({
        projectId: project.id,
        stage: project.stage,
        changedBy: userId,
      });

      await tx.insert(schema.projectApprovalChecklist).values(
        DEFAULT_CHECKLIST_STEPS.map((step, index) => ({
          projectId: project.id,
          stepNumber: index + 1,
          stepDescription: step.description,
          channel: step.channel,
        })),
      );

      return project;
    });
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const [updatedProject] = await db
      .update(schema.projects)
      .set({
        name: input.name,
        category: input.category,
        companyId: input.companyId,
        clientName: input.clientName,
        clientPhone: input.clientPhone,
        clientAddress: input.clientAddress,
        isPrivate: input.isPrivate,
        description: input.description,
        totalValue: input.totalValue?.toString(),
        currency: input.currency,
        firstPaymentAmount: input.firstPaymentAmount?.toString(),
        secondPaymentAmount: input.secondPaymentAmount?.toString(),
        startDate: input.startDate,
        estimatedEnd: input.estimatedEnd,
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.projects.id, id))
      .returning();

    if (!updatedProject) {
      throw new ProjectNotFoundError(id);
    }

    return updatedProject;
  }

  async changeStage(projectId: string, input: ChangeStageInput, userId: string): Promise<Project> {
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .limit(1);

    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    if (input.newStage === "cancelled") {
      if (project.stage === "cancelled") {
        throw new InvalidStageTransitionError(project.stage, input.newStage);
      }

      if (!input.notes?.trim()) {
        throw new CancellationReasonRequiredError();
      }
    } else if (!this.isForwardStage(project.stage, input.newStage)) {
      throw new InvalidStageTransitionError(project.stage, input.newStage);
    }

    await db.insert(schema.projectStageHistory).values({
      projectId,
      stage: input.newStage,
      changedBy: userId,
      notes: input.notes,
    });

    const [updatedProject] = await db
      .update(schema.projects)
      .set({
        stage: input.newStage,
        cancellationReason: input.newStage === "cancelled" ? input.notes : project.cancellationReason,
        endDate: input.newStage === "completed" ? todayISODate() : project.endDate,
        updatedAt: new Date(),
      })
      .where(eq(schema.projects.id, projectId))
      .returning();

    if (!updatedProject) {
      throw new Error(`Failed to change stage for project: ${projectId}`);
    }

    return updatedProject;
  }

  async addLogisticsTask(input: AddLogisticsTaskInput): Promise<ProjectLogisticsTask> {
    const [task] = await db
      .insert(schema.projectLogisticsTasks)
      .values({
        projectId: input.projectId,
        stage: input.stage,
        description: input.description,
        assignedTo: input.assignedTo,
      })
      .returning();

    if (!task) {
      throw new Error(`Failed to add logistics task for project: ${input.projectId}`);
    }

    return task;
  }

  async completeTask(taskId: string, userId: string): Promise<ProjectLogisticsTask> {
    const [task] = await db
      .update(schema.projectLogisticsTasks)
      .set({ isCompleted: true, completedAt: new Date(), completedBy: userId })
      .where(eq(schema.projectLogisticsTasks.id, taskId))
      .returning();

    if (!task) {
      throw new LogisticsTaskNotFoundError(taskId);
    }

    return task;
  }

  async uploadDocument(input: UploadDocumentInput, userId: string): Promise<ProjectDocument> {
    const [document] = await db
      .insert(schema.projectDocuments)
      .values({
        projectId: input.projectId,
        stage: input.stage,
        name: input.name,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        uploadedBy: userId,
      })
      .returning();

    if (!document) {
      throw new Error(`Failed to upload document for project: ${input.projectId}`);
    }

    return document;
  }

  async getUploadUrl(input: GetUploadUrlInput): Promise<SignedUploadUrl> {
    const path = `${input.projectId}/${Date.now()}-${input.fileName}`;
    return this.supabaseAdminService.createSignedUploadUrl(PROJECT_FILES_BUCKET, path);
  }

  async addExpense(input: AddExpenseInput, userId: string): Promise<ProjectExpense> {
    const [expense] = await db
      .insert(schema.projectExpenses)
      .values({
        projectId: input.projectId,
        stage: input.stage,
        description: input.description,
        amount: input.amount.toString(),
        paymentMethod: input.paymentMethod,
        receiptUrl: input.receiptUrl,
        createdBy: userId,
      })
      .returning();

    if (!expense) {
      throw new Error(`Failed to add expense for project: ${input.projectId}`);
    }

    if (input.paymentMethod === CASH_PAYMENT_METHOD) {
      await this.cashService.createAutomaticEntry({
        type: "expense",
        category: "other_expense",
        description: `Project expense: ${input.description}`,
        paymentMethod: input.paymentMethod,
        accountDestination: DEFAULT_CASH_DESTINATION,
        amount: input.amount,
        referenceId: input.projectId,
        referenceType: "project_expense",
        createdBy: userId,
      });
    }

    return expense;
  }

  async recordPayment(
    projectId: string,
    input: RecordPaymentInput,
    userId: string,
  ): Promise<ProjectPaymentReceived> {
    const nextPaymentNumber = await this.getNextPaymentNumber(projectId);

    const [payment] = await db
      .insert(schema.projectPaymentsReceived)
      .values({
        projectId,
        paymentNumber: nextPaymentNumber,
        amount: input.amount.toString(),
        paymentMethod: input.paymentMethod,
        accountDestination: input.accountDestination,
        receiptUrl: input.receiptUrl,
        notes: input.notes,
        createdBy: userId,
      })
      .returning();

    if (!payment) {
      throw new Error(`Failed to record payment for project: ${projectId}`);
    }

    await this.cashService.createAutomaticEntry({
      type: "income",
      category: "collection",
      description: `Project payment #${nextPaymentNumber}`,
      paymentMethod: input.paymentMethod,
      accountDestination: input.accountDestination,
      amount: input.amount,
      referenceId: projectId,
      referenceType: "project_payment",
      createdBy: userId,
    });

    return payment;
  }

  private async getNextPaymentNumber(projectId: string): Promise<number> {
    const [result] = await db
      .select({ maxPaymentNumber: sql<number | null>`max(${schema.projectPaymentsReceived.paymentNumber})` })
      .from(schema.projectPaymentsReceived)
      .where(eq(schema.projectPaymentsReceived.projectId, projectId));

    return (result?.maxPaymentNumber ?? 0) + 1;
  }

  async updateChecklist(
    checklistItemId: string,
    input: UpdateChecklistInput,
    userId: string,
  ): Promise<ProjectApprovalChecklist> {
    const [item] = await db
      .update(schema.projectApprovalChecklist)
      .set({
        isCompleted: input.isCompleted,
        completedAt: input.isCompleted ? new Date() : null,
        completedBy: input.isCompleted ? userId : null,
        notes: input.notes,
      })
      .where(eq(schema.projectApprovalChecklist.id, checklistItemId))
      .returning();

    if (!item) {
      throw new ChecklistItemNotFoundError(checklistItemId);
    }

    return item;
  }

  async getProjectSummary(id: string): Promise<ProjectSummary> {
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);

    if (!project) {
      throw new ProjectNotFoundError(id);
    }

    const [payments, expenses] = await Promise.all([
      db.select().from(schema.projectPaymentsReceived).where(eq(schema.projectPaymentsReceived.projectId, id)),
      db.select().from(schema.projectExpenses).where(eq(schema.projectExpenses.projectId, id)),
    ]);

    const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      totalValue: project.totalValue ? Number(project.totalValue) : 0,
      totalCollected,
      totalExpenses,
      grossMargin: totalCollected - totalExpenses,
    };
  }

  async generateNextCode(): Promise<string> {
    const result = await db.execute<{ nextval: string }>(
      sql`SELECT nextval('project_code_seq') AS nextval`,
    );
    const nextValue = result.rows[0]?.nextval;

    if (!nextValue) {
      throw new Error("Failed to generate next project code");
    }

    return `${PROJECT_CODE_PREFIX}-${nextValue.padStart(PROJECT_CODE_PADDING_LENGTH, "0")}`;
  }

  private async buildProjectDetail(project: Project): Promise<ProjectDetail> {
    const [companyRow] = project.companyId
      ? await db.select().from(schema.companies).where(eq(schema.companies.id, project.companyId)).limit(1)
      : [];

    const [logistics] = await db
      .select()
      .from(schema.projectLogistics)
      .where(eq(schema.projectLogistics.projectId, project.id))
      .limit(1);

    const [logisticsTasks, documents, expenses, paymentsReceived, checklist, stageHistory] = await Promise.all([
      db.select().from(schema.projectLogisticsTasks).where(eq(schema.projectLogisticsTasks.projectId, project.id)),
      db.select().from(schema.projectDocuments).where(eq(schema.projectDocuments.projectId, project.id)),
      db.select().from(schema.projectExpenses).where(eq(schema.projectExpenses.projectId, project.id)),
      db
        .select()
        .from(schema.projectPaymentsReceived)
        .where(eq(schema.projectPaymentsReceived.projectId, project.id)),
      db
        .select()
        .from(schema.projectApprovalChecklist)
        .where(eq(schema.projectApprovalChecklist.projectId, project.id)),
      db
        .select()
        .from(schema.projectStageHistory)
        .where(eq(schema.projectStageHistory.projectId, project.id))
        .orderBy(desc(schema.projectStageHistory.changedAt)),
    ]);

    return {
      ...project,
      companyName: companyRow?.name ?? null,
      logistics: logistics ?? null,
      logisticsTasks,
      documents,
      expenses,
      paymentsReceived,
      checklist,
      stageHistory,
    };
  }

  private isForwardStage(from: ProjectStage, to: ProjectStage): boolean {
    const forwardStages: readonly ProjectStage[] = PROJECT_STAGES.filter((stage) => stage !== "cancelled");
    return forwardStages.indexOf(to) > forwardStages.indexOf(from);
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    return user?.role === ADMIN_ROLE;
  }
}
