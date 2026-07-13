import { PAYMENT_METHODS, SALE_STATUSES, SALE_TYPES } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requireAdmin, requirePermission } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { SalesService } from "./sales.service.js";
import { EmptySaleError, SaleAlreadyCancelledError, SaleNotFoundError } from "./sales.types.js";

const SALES_MODULE = "sales";

const salesService = new SalesService();

const saleFiltersInputSchema = z.object({
  clientId: z.string().uuid().optional(),
  type: z.enum(SALE_TYPES).optional(),
  status: z.enum(SALE_STATUSES).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

const getSaleInputSchema = z.object({ id: z.string().uuid() });

const createSaleItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  notes: z.string().optional(),
});

const createSaleInputSchema = z.object({
  type: z.enum(SALE_TYPES),
  clientId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  saleDate: z.string().optional(),
  notes: z.string().optional(),
  discount: z.number().nonnegative().optional(),
  items: z.array(createSaleItemInputSchema).min(1),
});

const addPaymentInputSchema = z.object({
  saleId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  accountDestination: z.string().min(1),
  notes: z.string().optional(),
});

const cancelSaleInputSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1),
});

function toTrpcError(error: unknown): TRPCError {
  if (error instanceof SaleNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  if (error instanceof EmptySaleError || error instanceof SaleAlreadyCancelledError) {
    return new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  });
}

export const salesRouter = router({
  list: protectedProcedure.input(saleFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, SALES_MODULE, "view");
    return salesService.findAll(input);
  }),

  get: protectedProcedure.input(getSaleInputSchema).query(async ({ ctx, input }) => {
    requirePermission(ctx, SALES_MODULE, "view");

    try {
      return await salesService.findById(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  create: protectedProcedure.input(createSaleInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, SALES_MODULE, "create");

    try {
      return await salesService.create(input, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  addPayment: protectedProcedure.input(addPaymentInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, SALES_MODULE, "edit");

    const { saleId, ...payment } = input;

    try {
      return await salesService.addPayment(saleId, payment, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  cancel: protectedProcedure.input(cancelSaleInputSchema).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx);

    try {
      return await salesService.cancelSale(input.id, input.reason, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),
});
