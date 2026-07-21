import { CHECKLIST_CHANNELS, PAYMENT_METHODS, PROJECT_CATEGORIES, PROJECT_STAGES } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requireAdmin, requirePermission } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { ProjectsService } from "./projects.service.js";
import {
  CancellationReasonRequiredError,
  ChecklistItemNotFoundError,
  InvalidStageTransitionError,
  LogisticsTaskNotFoundError,
  PrivateProjectAccessDeniedError,
  ProjectNotFoundError,
} from "./projects.types.js";

const PROJECTS_MODULE = "projects";

const projectsService = new ProjectsService();

const projectFiltersInputSchema = z.object({
  companyId: z.string().uuid().optional(),
  category: z.enum(PROJECT_CATEGORIES).optional(),
  stage: z.enum(PROJECT_STAGES).optional(),
});

const getProjectInputSchema = z.object({ id: z.string().uuid() });

const createProjectInputSchema = z.object({
  name: z.string().min(1),
  category: z.enum(PROJECT_CATEGORIES),
  companyId: z.string().uuid().optional(),
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  isPrivate: z.boolean().optional(),
  description: z.string().optional(),
  totalValue: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  firstPaymentAmount: z.number().nonnegative().optional(),
  secondPaymentAmount: z.number().nonnegative().optional(),
  startDate: z.string().optional(),
  estimatedEnd: z.string().optional(),
  notes: z.string().optional(),
});

const updateProjectInputSchema = createProjectInputSchema
  .omit({ isPrivate: true })
  .extend({ id: z.string().uuid(), isPrivate: z.boolean() });

const changeStageInputSchema = z.object({
  projectId: z.string().uuid(),
  newStage: z.enum(PROJECT_STAGES),
  notes: z.string().optional(),
});

const addLogisticsTaskInputSchema = z.object({
  projectId: z.string().uuid(),
  stage: z.enum(PROJECT_STAGES),
  description: z.string().min(1),
  assignedTo: z.string().uuid().optional(),
});

const completeTaskInputSchema = z.object({ id: z.string().uuid() });

const uploadDocumentInputSchema = z.object({
  projectId: z.string().uuid(),
  stage: z.enum(PROJECT_STAGES).optional(),
  name: z.string().min(1),
  fileUrl: z.string().min(1),
  fileType: z.string().optional(),
});

const addExpenseInputSchema = z.object({
  projectId: z.string().uuid(),
  stage: z.enum(PROJECT_STAGES).optional(),
  description: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  receiptUrl: z.string().optional(),
});

const recordPaymentInputSchema = z.object({
  projectId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  accountDestination: z.string().min(1),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});

const updateChecklistInputSchema = z.object({
  id: z.string().uuid(),
  isCompleted: z.boolean().optional(),
  stepDescription: z.string().min(1).optional(),
  notes: z.string().optional(),
});

const addChecklistItemInputSchema = z.object({
  projectId: z.string().uuid(),
  stepDescription: z.string().min(1),
  channel: z.enum(CHECKLIST_CHANNELS).optional(),
});

const removeChecklistItemInputSchema = z.object({ id: z.string().uuid() });

const reorderChecklistInputSchema = z.object({
  projectId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

const getSummaryInputSchema = z.object({ id: z.string().uuid() });

const getUploadUrlInputSchema = z.object({
  projectId: z.string().uuid(),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

function toTrpcError(error: unknown): TRPCError {
  if (error instanceof ProjectNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  if (error instanceof LogisticsTaskNotFoundError || error instanceof ChecklistItemNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  if (error instanceof PrivateProjectAccessDeniedError) {
    return new TRPCError({ code: "FORBIDDEN", message: error.message });
  }

  if (
    error instanceof InvalidStageTransitionError ||
    error instanceof CancellationReasonRequiredError
  ) {
    return new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  });
}

export const projectsRouter = router({
  list: protectedProcedure.input(projectFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "view");
    return projectsService.findAll({ ...input, userId: ctx.user.id });
  }),

  get: protectedProcedure.input(getProjectInputSchema).query(async ({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "view");

    try {
      return await projectsService.findById(input.id, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  create: protectedProcedure.input(createProjectInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "create");
    return projectsService.create(input, ctx.user.id);
  }),

  update: protectedProcedure.input(updateProjectInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "edit");

    const { id, ...updateInput } = input;

    try {
      return await projectsService.update(id, updateInput);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  changeStage: protectedProcedure.input(changeStageInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "edit");

    const { projectId, ...changeStageInput } = input;

    try {
      return await projectsService.changeStage(projectId, changeStageInput, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  addTask: protectedProcedure.input(addLogisticsTaskInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "edit");
    return projectsService.addLogisticsTask(input);
  }),

  completeTask: protectedProcedure.input(completeTaskInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "edit");

    try {
      return await projectsService.completeTask(input.id, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  getUploadUrl: protectedProcedure.input(getUploadUrlInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "create");
    return projectsService.getUploadUrl(input);
  }),

  uploadDocument: protectedProcedure.input(uploadDocumentInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "create");

    try {
      return await projectsService.uploadDocument(input, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  addExpense: protectedProcedure.input(addExpenseInputSchema).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx);

    try {
      return await projectsService.addExpense(input, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  recordPayment: protectedProcedure.input(recordPaymentInputSchema).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx);

    const { projectId, ...paymentInput } = input;

    try {
      return await projectsService.recordPayment(projectId, paymentInput, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  updateChecklist: protectedProcedure.input(updateChecklistInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "edit");

    const { id, ...checklistInput } = input;

    try {
      return await projectsService.updateChecklist(id, checklistInput, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  addChecklistItem: protectedProcedure.input(addChecklistItemInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "edit");
    return projectsService.addChecklistItem(input);
  }),

  removeChecklistItem: protectedProcedure
    .input(removeChecklistItemInputSchema)
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx, PROJECTS_MODULE, "edit");

      try {
        return await projectsService.removeChecklistItem(input.id);
      } catch (error) {
        throw toTrpcError(error);
      }
    }),

  reorderChecklist: protectedProcedure.input(reorderChecklistInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, PROJECTS_MODULE, "edit");
    return projectsService.reorderChecklist(input);
  }),

  getSummary: protectedProcedure.input(getSummaryInputSchema).query(async ({ ctx, input }) => {
    requireAdmin(ctx);

    try {
      return await projectsService.getProjectSummary(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),
});
