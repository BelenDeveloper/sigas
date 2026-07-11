import "dotenv/config";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import { db } from "./client.js";
import {
  companies,
  companyUserAccess,
  MODULES,
  userModulePermissions,
  users,
  type ModuleKey,
  type UserRole,
} from "./schema/index.js";

interface ModulePermissionSeed {
  module: ModuleKey;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
}

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  permissions: ModulePermissionSeed[];
}

interface PermissionPresetConfig {
  canViewModules?: ModuleKey[];
  canCreateModules?: ModuleKey[];
  canEditModules?: ModuleKey[];
}

function buildPermissions(config: PermissionPresetConfig): ModulePermissionSeed[] {
  const canViewModules = config.canViewModules ?? [];
  const canCreateModules = config.canCreateModules ?? [];
  const canEditModules = config.canEditModules ?? [];

  return MODULES.map((module) => ({
    module,
    canView: canViewModules.includes(module),
    canCreate: canCreateModules.includes(module),
    canEdit: canEditModules.includes(module),
  }));
}

const SEED_USERS: SeedUser[] = [
  {
    name: "Cristian Zaballa",
    email: "cristian@sigas.bo",
    password: "changeme123",
    role: "admin",
    isActive: true,
    permissions: buildPermissions({
      canViewModules: [...MODULES],
      canCreateModules: [...MODULES],
      canEditModules: [...MODULES],
    }),
  },
  {
    name: "Harold",
    email: "harold@sigas.bo",
    password: "changeme123",
    role: "logistics",
    isActive: true,
    permissions: buildPermissions({
      canViewModules: ["projects"],
      canCreateModules: ["projects"],
      canEditModules: ["projects"],
    }),
  },
  {
    name: "Mirael",
    email: "mirael@sigas.bo",
    password: "changeme123",
    role: "sales",
    isActive: true,
    permissions: buildPermissions({
      canViewModules: ["sales", "clients", "inventory"],
      canCreateModules: ["sales", "clients", "inventory"],
    }),
  },
  {
    name: "Natalia",
    email: "natalia@sigas.bo",
    password: "changeme123",
    role: "custom",
    isActive: false,
    permissions: buildPermissions({}),
  },
];

interface SeedCompany {
  name: string;
  description: string;
  grantedEmails: string[];
}

const MAIN_COMPANY_NAME = "SIGAS Cochabamba";

const SEED_COMPANIES: SeedCompany[] = [
  {
    name: MAIN_COMPANY_NAME,
    description: "Sede principal de operaciones",
    grantedEmails: SEED_USERS.map((seedUser) => seedUser.email),
  },
  {
    name: "SIGAS Oruro",
    description: "Sucursal de Oruro",
    grantedEmails: [],
  },
  {
    name: "SIGAS Santa Cruz",
    description: "Sucursal de Santa Cruz",
    grantedEmails: [],
  },
];

function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function createSeedUser(supabase: SupabaseClient, seedUser: SeedUser): Promise<void> {
  const [existingUser] = await db.select().from(users).where(eq(users.email, seedUser.email)).limit(1);

  if (existingUser) {
    console.log(`Skipping ${seedUser.email} — already exists.`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: seedUser.email,
    password: seedUser.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(
      `Failed to create auth user for ${seedUser.email}: ${error?.message ?? "unknown error"}`,
    );
  }

  const [newUser] = await db
    .insert(users)
    .values({
      id: data.user.id,
      name: seedUser.name,
      email: seedUser.email,
      role: seedUser.role,
      isActive: seedUser.isActive,
    })
    .returning();

  if (!newUser) {
    throw new Error(`Failed to insert user row for ${seedUser.email}`);
  }

  if (seedUser.permissions.length > 0) {
    await db
      .insert(userModulePermissions)
      .values(seedUser.permissions.map((permission) => ({ userId: newUser.id, ...permission })));
  }

  console.log(`Seeded ${seedUser.email}.`);
}

async function getUserIdByEmail(email: string): Promise<string> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  return user.id;
}

async function grantCompanyAccess(
  companyId: string,
  userId: string,
  access: { canView: boolean; canEdit: boolean },
): Promise<void> {
  await db
    .insert(companyUserAccess)
    .values({ companyId, userId, canView: access.canView, canEdit: access.canEdit })
    .onConflictDoNothing();
}

async function createSeedCompany(company: SeedCompany, createdByUserId: string): Promise<void> {
  const [existingCompany] = await db
    .select()
    .from(companies)
    .where(eq(companies.name, company.name))
    .limit(1);

  let companyId: string;

  if (existingCompany) {
    console.log(`Skipping company ${company.name} — already exists.`);
    companyId = existingCompany.id;
  } else {
    const [newCompany] = await db
      .insert(companies)
      .values({ name: company.name, description: company.description, createdBy: createdByUserId })
      .returning();

    if (!newCompany) {
      throw new Error(`Failed to insert company row for ${company.name}`);
    }

    companyId = newCompany.id;
    console.log(`Seeded company ${company.name}.`);
  }

  await grantCompanyAccess(companyId, createdByUserId, { canView: true, canEdit: true });

  for (const email of company.grantedEmails) {
    const userId = await getUserIdByEmail(email);
    await grantCompanyAccess(companyId, userId, { canView: true, canEdit: false });
  }
}

async function main(): Promise<void> {
  const supabase = getSupabaseAdminClient();

  for (const seedUser of SEED_USERS) {
    await createSeedUser(supabase, seedUser);
  }

  const adminSeedUser = SEED_USERS.find((seedUser) => seedUser.role === "admin");
  if (!adminSeedUser) {
    throw new Error("No admin seed user configured");
  }

  const adminUserId = await getUserIdByEmail(adminSeedUser.email);

  for (const company of SEED_COMPANIES) {
    await createSeedCompany(company, adminUserId);
  }
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
