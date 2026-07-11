import { Injectable } from "@nestjs/common";
import { db, schema, type User } from "@repo/db";
import { eq, sql } from "drizzle-orm";

import { SupabaseAdminService } from "../supabase/supabase.service.js";
import {
  buildAdminPermissions,
  buildLogisticsPermissions,
  buildNoPermissions,
  buildSalesPermissions,
} from "./permission-presets.js";
import type {
  CreateUserInput,
  ModulePermission,
  UpdateUserInput,
  UserWithPermissions,
} from "./users.types.js";

@Injectable()
export class UsersService {
  constructor(private readonly supabaseAdminService: SupabaseAdminService) {}

  async findById(userId: string): Promise<UserWithPermissions | null> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);

    if (!user) {
      return null;
    }

    const permissions = await this.findPermissions(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      permissions,
    };
  }

  async findAll(): Promise<User[]> {
    return db.select().from(schema.users);
  }

  async create(input: CreateUserInput): Promise<User> {
    const { data, error } = await this.supabaseAdminService.client.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Failed to create Supabase auth user");
    }

    const [newUser] = await db
      .insert(schema.users)
      .values({ id: data.user.id, name: input.name, email: input.email, role: input.role })
      .returning();

    if (!newUser) {
      throw new Error(`Failed to insert user row for ${input.email}`);
    }

    await this.upsertPermissions(newUser.id, input.permissions);

    return newUser;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const [updatedUser] = await db
      .update(schema.users)
      .set({ name: input.name, role: input.role, isActive: input.isActive, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`User not found: ${id}`);
    }

    return updatedUser;
  }

  async updatePermissions(userId: string, permissions: ModulePermission[]): Promise<void> {
    await this.upsertPermissions(userId, permissions);
  }

  async toggleActive(id: string): Promise<User> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);

    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    const [updatedUser] = await db
      .update(schema.users)
      .set({ isActive: !user.isActive, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`Failed to toggle active state for user: ${id}`);
    }

    return updatedUser;
  }

  // Reference seed data; packages/db/seed.ts mirrors this (it runs outside the Nest DI graph).
  getSeedUsers(): Array<CreateUserInput & { isActive: boolean }> {
    return [
      {
        name: "Cristian Zaballa",
        email: "cristian@sigas.bo",
        password: "changeme123",
        role: "admin",
        isActive: true,
        permissions: buildAdminPermissions(),
      },
      {
        name: "Harold",
        email: "harold@sigas.bo",
        password: "changeme123",
        role: "logistics",
        isActive: true,
        permissions: buildLogisticsPermissions(),
      },
      {
        name: "Mirael",
        email: "mirael@sigas.bo",
        password: "changeme123",
        role: "sales",
        isActive: true,
        permissions: buildSalesPermissions(),
      },
      {
        name: "Natalia",
        email: "natalia@sigas.bo",
        password: "changeme123",
        role: "custom",
        isActive: false,
        permissions: buildNoPermissions(),
      },
    ];
  }

  private async findPermissions(userId: string): Promise<ModulePermission[]> {
    const rows = await db
      .select()
      .from(schema.userModulePermissions)
      .where(eq(schema.userModulePermissions.userId, userId));

    return rows.map((row) => ({
      module: row.module,
      canView: row.canView,
      canCreate: row.canCreate,
      canEdit: row.canEdit,
    }));
  }

  private async upsertPermissions(userId: string, permissions: ModulePermission[]): Promise<void> {
    if (permissions.length === 0) {
      return;
    }

    await db
      .insert(schema.userModulePermissions)
      .values(permissions.map((permission) => ({ userId, ...permission })))
      .onConflictDoUpdate({
        target: [schema.userModulePermissions.userId, schema.userModulePermissions.module],
        set: {
          canView: sql`excluded.can_view`,
          canCreate: sql`excluded.can_create`,
          canEdit: sql`excluded.can_edit`,
        },
      });
  }
}
