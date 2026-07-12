import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requireAdmin, requirePermission } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { SuppliersService } from "./suppliers.service.js";
import { SupplierNotFoundError } from "./suppliers.types.js";

const SUPPLIERS_MODULE = "suppliers";

const suppliersService = new SuppliersService();

const supplierFiltersInputSchema = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  showInactive: z.boolean().optional(),
});

const getSupplierInputSchema = z.object({ id: z.string().uuid() });

const createSupplierInputSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().optional(),
  nit: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

const updateSupplierInputSchema = createSupplierInputSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

const toggleActiveInputSchema = z.object({ id: z.string().uuid() });

function toTrpcError(error: unknown): TRPCError {
  if (error instanceof SupplierNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  });
}

export const suppliersRouter = router({
  list: protectedProcedure.input(supplierFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, SUPPLIERS_MODULE, "view");
    return suppliersService.findAll(input);
  }),

  get: protectedProcedure.input(getSupplierInputSchema).query(async ({ ctx, input }) => {
    requirePermission(ctx, SUPPLIERS_MODULE, "view");

    try {
      return await suppliersService.findById(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  create: protectedProcedure.input(createSupplierInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, SUPPLIERS_MODULE, "create");
    return suppliersService.create(input, ctx.user.id);
  }),

  update: protectedProcedure.input(updateSupplierInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, SUPPLIERS_MODULE, "edit");

    const { id, ...updateInput } = input;

    try {
      return await suppliersService.update(id, updateInput);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  toggleActive: protectedProcedure.input(toggleActiveInputSchema).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx);

    try {
      return await suppliersService.toggleActive(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),
});
