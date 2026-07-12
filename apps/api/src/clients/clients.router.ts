import { CLIENT_DOCUMENT_TYPES } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requireAdmin, requirePermission } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { ClientsService } from "./clients.service.js";
import { ClientNotFoundError } from "./clients.types.js";

const CLIENTS_MODULE = "clients";

const clientsService = new ClientsService();

const clientFiltersInputSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
});

const getClientInputSchema = z.object({ id: z.string().uuid() });

const createClientInputSchema = z.object({
  name: z.string().min(1),
  documentType: z.enum(CLIENT_DOCUMENT_TYPES).optional(),
  documentNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

const updateClientInputSchema = createClientInputSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

const toggleActiveInputSchema = z.object({ id: z.string().uuid() });

function toTrpcError(error: unknown): TRPCError {
  if (error instanceof ClientNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
  });
}

export const clientsRouter = router({
  list: protectedProcedure.input(clientFiltersInputSchema).query(({ ctx, input }) => {
    requirePermission(ctx, CLIENTS_MODULE, "view");
    return clientsService.findAll(input);
  }),

  get: protectedProcedure.input(getClientInputSchema).query(async ({ ctx, input }) => {
    requirePermission(ctx, CLIENTS_MODULE, "view");

    try {
      return await clientsService.findById(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  create: protectedProcedure.input(createClientInputSchema).mutation(({ ctx, input }) => {
    requirePermission(ctx, CLIENTS_MODULE, "create");
    return clientsService.create(input, ctx.user.id);
  }),

  update: protectedProcedure.input(updateClientInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, CLIENTS_MODULE, "edit");

    const { id, ...updateInput } = input;

    try {
      return await clientsService.update(id, updateInput);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),

  toggleActive: protectedProcedure.input(toggleActiveInputSchema).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx);

    try {
      return await clientsService.toggleActive(input.id);
    } catch (error) {
      throw toTrpcError(error);
    }
  }),
});
