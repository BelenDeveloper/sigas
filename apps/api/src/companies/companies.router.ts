import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requireAdmin } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { CompaniesService } from "./companies.service.js";
import { CompanyAccessDeniedError, CompanyNotFoundError } from "./companies.types.js";

const companiesService = new CompaniesService();

const createCompanyInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateCompanyInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean(),
});

const updateAccessInputSchema = z.object({
  companyId: z.string().uuid(),
  userId: z.string().uuid(),
  canView: z.boolean(),
  canEdit: z.boolean(),
});

const getInputSchema = z.object({ id: z.string().uuid() });
const getAccessListInputSchema = z.object({ companyId: z.string().uuid() });

function toTrpcError(error: unknown): TRPCError {
  if (error instanceof CompanyNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  if (error instanceof CompanyAccessDeniedError) {
    return new TRPCError({ code: "FORBIDDEN", message: error.message });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  });
}

export const companiesRouter = router({
  list: protectedProcedure.query(({ ctx }) => companiesService.findAll(ctx.user.id)),

  get: protectedProcedure.input(getInputSchema).query(async ({ ctx, input }) => {
    try {
      return await companiesService.findById(input.id, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  create: protectedProcedure.input(createCompanyInputSchema).mutation(({ ctx, input }) => {
    requireAdmin(ctx);
    return companiesService.create(input, ctx.user.id);
  }),

  update: protectedProcedure.input(updateCompanyInputSchema).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx);

    const { id, ...updateInput } = input;

    try {
      return await companiesService.update(id, updateInput);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  updateAccess: protectedProcedure
    .input(updateAccessInputSchema)
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      const { companyId, userId, ...access } = input;
      await companiesService.updateAccess(companyId, userId, access);
      return { success: true as const };
    }),

  getAccessList: protectedProcedure.input(getAccessListInputSchema).query(({ ctx, input }) => {
    requireAdmin(ctx);
    return companiesService.getAccessList(input.companyId);
  }),
});
