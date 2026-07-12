import { PRODUCT_UNITS, STOCK_MOVEMENT_TYPES } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requirePermission } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { InventoryService } from "./inventory.service.js";
import { InsufficientStockError, ProductNotFoundError } from "./inventory.types.js";

const INVENTORY_MODULE = "inventory";

const inventoryService = new InventoryService();

const productFiltersInputSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  showInactive: z.boolean().optional(),
});

const getProductInputSchema = z.object({ id: z.string().uuid() });

const createProductInputSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  unit: z.enum(PRODUCT_UNITS),
  costPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  minimumStock: z.number().nonnegative().optional(),
  maximumStock: z.number().nonnegative().optional(),
  location: z.string().optional(),
  netWeight: z.number().nonnegative().optional(),
  grossWeight: z.number().nonnegative().optional(),
});

const updateProductInputSchema = createProductInputSchema
  .omit({ sku: true })
  .extend({ id: z.string().uuid(), isActive: z.boolean() });

const adjustStockInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().refine((value) => value !== 0, "Quantity must not be zero"),
  reason: z.string().optional(),
});

const movementFiltersInputSchema = z.object({
  productId: z.string().uuid().optional(),
  type: z.enum(STOCK_MOVEMENT_TYPES).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

const listSubcategoriesInputSchema = z.object({
  categoryId: z.string().uuid().optional(),
});

function toTrpcError(error: unknown): TRPCError {
  if (error instanceof ProductNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  if (error instanceof InsufficientStockError) {
    return new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  });
}

export const inventoryRouter = router({
  listProducts: protectedProcedure.input(productFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, INVENTORY_MODULE, "view");
    return inventoryService.findProducts(input);
  }),

  getProduct: protectedProcedure.input(getProductInputSchema).query(async ({ ctx, input }) => {
    requirePermission(ctx, INVENTORY_MODULE, "view");

    try {
      return await inventoryService.findProductById(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  createProduct: protectedProcedure.input(createProductInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, INVENTORY_MODULE, "create");
    return inventoryService.createProduct(input, ctx.user.id);
  }),

  updateProduct: protectedProcedure.input(updateProductInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, INVENTORY_MODULE, "edit");

    const { id, ...updateInput } = input;

    try {
      return await inventoryService.updateProduct(id, updateInput, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  adjustStock: protectedProcedure.input(adjustStockInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, INVENTORY_MODULE, "edit");

    try {
      return await inventoryService.adjustStock(input.productId, input.quantity, input.reason, ctx.user.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  listMovements: protectedProcedure.input(movementFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, INVENTORY_MODULE, "view");
    return inventoryService.findMovements(input);
  }),

  getLowStock: protectedProcedure.query(({ ctx }) => {
    requirePermission(ctx, INVENTORY_MODULE, "view");
    return inventoryService.getLowStockProducts();
  }),

  listCategories: protectedProcedure.query(({ ctx }) => {
    requirePermission(ctx, INVENTORY_MODULE, "view");
    return inventoryService.findCategories();
  }),

  listSubcategories: protectedProcedure
    .input(listSubcategoriesInputSchema)
    .query(({ ctx, input }) => {
      requirePermission(ctx, INVENTORY_MODULE, "view");
      return inventoryService.findSubcategories(input.categoryId);
    }),
});
