import { Injectable } from "@nestjs/common";
import { db, schema, type ModuleKey, type User, type UserRole } from "@repo/db";
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

interface UserPermissionRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  module: ModuleKey | null;
  canView: boolean | null;
  canCreate: boolean | null;
  canEdit: boolean | null;
}

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

  async findAll(): Promise<UserWithPermissions[]> {
    const rows = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        isActive: schema.users.isActive,
        module: schema.userModulePermissions.module,
        canView: schema.userModulePermissions.canView,
        canCreate: schema.userModulePermissions.canCreate,
        canEdit: schema.userModulePermissions.canEdit,
      })
      .from(schema.users)
      .leftJoin(
        schema.userModulePermissions,
        eq(schema.userModulePermissions.userId, schema.users.id),
      );

    return this.groupRowsByUser(rows);
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

  private groupRowsByUser(rows: UserPermissionRow[]): UserWithPermissions[] {
    const userMap = new Map<string, UserWithPermissions>();

    for (const row of rows) {
      let user = userMap.get(row.id);

      if (!user) {
        user = {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          isActive: row.isActive,
          permissions: [],
        };
        userMap.set(row.id, user);
      }

      if (row.module && row.canView !== null && row.canCreate !== null && row.canEdit !== null) {
        user.permissions.push({
          module: row.module,
          canView: row.canView,
          canCreate: row.canCreate,
          canEdit: row.canEdit,
        });
      }
    }

    return Array.from(userMap.values());
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
