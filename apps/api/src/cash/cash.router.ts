import { CASH_CONTEXTS, CASH_ENTRY_TYPES, CREDITOR_TYPES, PAYABLE_STATUSES, PAYMENT_METHODS } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requireAdmin, requirePermission } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { CashService } from "./cash.service.js";
import {
  CashEntryNotFoundError,
  CashSessionNotFoundError,
  NoOpenSessionError,
  PayableNotFoundError,
  SessionAlreadyOpenError,
} from "./cash.types.js";

const CASH_MODULE = "cash";

const cashService = new CashService();

const entryFiltersInputSchema = z.object({
  sessionId: z.string().uuid().optional(),
  type: z.enum(CASH_ENTRY_TYPES).optional(),
  category: z.string().optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

const closeSessionInputSchema = z.object({
  sessionId: z.string().uuid(),
  closingAmount: z.number().nonnegative(),
});

const addManualEntryInputSchema = z.object({
  type: z.enum(CASH_ENTRY_TYPES),
  category: z.string().min(1),
  description: z.string().min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
  accountDestination: z.string().optional(),
  amount: z.number().positive(),
});

const cancelEntryInputSchema = z.object({ id: z.string().uuid() });

const whereIsTheMoneyInputSchema = z.object({
  sessionId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  cashContext: z.enum(CASH_CONTEXTS).optional(),
});

const dailySummaryInputSchema = z.object({ sessionId: z.string().uuid() });

const addPartnerDistributionInputSchema = z.object({
  partnerName: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  accountDestination: z.string().optional(),
});

const payableFiltersInputSchema = z.object({
  creditorType: z.enum(CREDITOR_TYPES).optional(),
  status: z.enum(PAYABLE_STATUSES).optional(),
  search: z.string().optional(),
});

const createPayableInputSchema = z.object({
  creditorType: z.enum(CREDITOR_TYPES),
  supplierId: z.string().uuid().optional(),
  creditorName: z.string().min(1),
  purchaseId: z.string().uuid().optional(),
  amount: z.number().positive(),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  invoiceNumber: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const addPayablePaymentInputSchema = z.object({
  payableId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  destination: z.string().optional(),
});

function toTrpcError(error: unknown): TRPCError {
  if (
    error instanceof CashSessionNotFoundError ||
    error instanceof CashEntryNotFoundError ||
    error instanceof PayableNotFoundError
  ) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  if (error instanceof NoOpenSessionError || error instanceof SessionAlreadyOpenError) {
    return new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  });
}

export const cashRouter = router({
  getCurrentSession: protectedProcedure.query(({ ctx }) => {
    requirePermission(ctx, CASH_MODULE, "view");
    return cashService.getCurrentSession();
  }),

  openSession: protectedProcedure.mutation(async ({ ctx }) => {
    requirePermission(ctx, CASH_MODULE, "create");

    try {
      return await cashService.openSession(ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  closeSession: protectedProcedure.input(closeSessionInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, CASH_MODULE, "edit");

    try {
      return await cashService.closeSession(input.sessionId, input.closingAmount);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  listEntries: protectedProcedure.input(entryFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, CASH_MODULE, "view");
    return cashService.getEntries(input);
  }),

  addEntry: protectedProcedure.input(addManualEntryInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, CASH_MODULE, "create");

    try {
      return await cashService.addManualEntry(input, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  cancelEntry: protectedProcedure.input(cancelEntryInputSchema).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx);

    try {
      return await cashService.cancelEntry(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  getWhereIsTheMoney: protectedProcedure.input(whereIsTheMoneyInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, CASH_MODULE, "view");
    return cashService.getWhereIsTheMoney(input);
  }),

  getDailySummary: protectedProcedure.input(dailySummaryInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, CASH_MODULE, "view");
    return cashService.getDailySummary(input.sessionId);
  }),

  addPartnerDistribution: protectedProcedure
    .input(addPartnerDistributionInputSchema)
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);

      try {
        return await cashService.addPartnerDistribution(input, ctx.user.id);
      } catch (error) {
        throw toTrpcError(error);
      }
    }),

  listPayables: protectedProcedure.input(payableFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, CASH_MODULE, "view");
    return cashService.listPayables(input);
  }),

  createPayable: protectedProcedure.input(createPayableInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, CASH_MODULE, "create");
    return cashService.createPayable(input, ctx.user.id);
  }),

  addPayablePayment: protectedProcedure
    .input(addPayablePaymentInputSchema)
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx, CASH_MODULE, "edit");

      const { payableId, ...payment } = input;

      try {
        return await cashService.addPayablePayment(payableId, payment, ctx.user.id);
      } catch (error) {
        throw toTrpcError(error);
      }
    }),

  getOverduePayables: protectedProcedure.query(({ ctx }) => {
    requirePermission(ctx, CASH_MODULE, "view");
    return cashService.getOverduePayables();
  }),

  getPayablePayments: protectedProcedure
    .input(z.object({ payableId: z.string().uuid() }))
    .query(({ ctx, input }) => {
      requirePermission(ctx, CASH_MODULE, "view");
      return cashService.getPayablePayments(input.payableId);
    }),
});
