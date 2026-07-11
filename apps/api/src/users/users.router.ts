import { MODULES, USER_ROLES } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { SupabaseAdminService } from "../supabase/supabase.service.js";
import { requirePermission } from "../trpc/guards.js";
import { protectedProcedure, router } from "../trpc/trpc.service.js";
import { UsersService } from "./users.service.js";

const USERS_MODULE = "users";

const usersService = new UsersService(new SupabaseAdminService());

const modulePermissionSchema = z.object({
  module: z.enum(MODULES),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canEdit: z.boolean(),
});

const createUserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(USER_ROLES),
  permissions: z.array(modulePermissionSchema),
});

const updateUserInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
});

const updatePermissionsInputSchema = z.object({
  userId: z.string().uuid(),
  permissions: z.array(modulePermissionSchema),
});

const toggleActiveInputSchema = z.object({ id: z.string().uuid() });

export const usersRouter = router({
  me: protectedProcedure.query(({ ctx }) => ctx.user),

  list: protectedProcedure.query(({ ctx }) => {
    requirePermission(ctx, USERS_MODULE, "view");
    return usersService.findAll();
  }),

  create: protectedProcedure.input(createUserInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, USERS_MODULE, "create");

    try {
      return await usersService.create(input);
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error instanceof Error ? error.message : "Failed to create user",
      });
    }
  }),

  update: protectedProcedure.input(updateUserInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, USERS_MODULE, "edit");

    const { id, ...updateInput } = input;

    try {
      return await usersService.update(id, updateInput);
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: error instanceof Error ? error.message : "User not found",
      });
    }
  }),

  updatePermissions: protectedProcedure
    .input(updatePermissionsInputSchema)
    .mutation(async ({ ctx, input }) => {
      requirePermission(ctx, USERS_MODULE, "edit");
      await usersService.updatePermissions(input.userId, input.permissions);
      return { success: true as const };
    }),

  toggleActive: protectedProcedure.input(toggleActiveInputSchema).mutation(async ({ ctx, input }) => {
    requirePermission(ctx, USERS_MODULE, "edit");

    try {
      return await usersService.toggleActive(input.id);
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: error instanceof Error ? error.message : "User not found",
      });
    }
  }),
});
