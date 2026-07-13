import { PAYMENT_METHODS, PURCHASE_STATUSES } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requirePermission } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { PurchasesService } from "./purchases.service.js";
import { EmptyPurchaseError, PurchaseNotFoundError } from "./purchases.types.js";

const PURCHASES_MODULE = "purchases";

const purchasesService = new PurchasesService();

const purchaseFiltersInputSchema = z.object({
  supplierId: z.string().uuid().optional(),
  status: z.enum(PURCHASE_STATUSES).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const getPurchaseInputSchema = z.object({ id: z.string().uuid() });

const createPurchaseItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative(),
  notes: z.string().optional(),
});

const createPurchaseInputSchema = z.object({
  supplierId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(createPurchaseItemInputSchema).min(1),
});

const addPaymentInputSchema = z.object({
  purchaseId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  accountDestination: z.string().min(1),
  notes: z.string().optional(),
});

function toTrpcError(error: unknown): TRPCError {
  if (error instanceof PurchaseNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  if (error instanceof EmptyPurchaseError) {
    return new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  });
}

export const purchasesRouter = router({
  list: protectedProcedure.input(purchaseFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, PURCHASES_MODULE, "view");
    return purchasesService.findAll(input);
  }),

  get: protectedProcedure.input(getPurchaseInputSchema).query(async ({ ctx, input }) => {
    requirePermission(ctx, PURCHASES_MODULE, "view");

    try {
      return await purchasesService.findById(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  create: protectedProcedure.input(createPurchaseInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, PURCHASES_MODULE, "create");

    try {
      return await purchasesService.create(input, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  addPayment: protectedProcedure.input(addPaymentInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, PURCHASES_MODULE, "edit");

    const { purchaseId, ...payment } = input;

    try {
      return await purchasesService.addPayment(purchaseId, payment, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),
});
