import { Injectable } from "@nestjs/common";
import { db, schema, type Company } from "@repo/db";
import { and, eq } from "drizzle-orm";

import {
  CompanyAccessDeniedError,
  CompanyNotFoundError,
  type CompanyAccessEntry,
  type CompanyAccessInput,
  type CreateCompanyInput,
  type UpdateCompanyInput,
} from "./companies.types.js";

const ADMIN_ROLE = "admin";

@Injectable()
export class CompaniesService {
  async findAll(userId: string): Promise<Company[]> {
    if (await this.isAdmin(userId)) {
      return db.select().from(schema.companies);
    }

    return db
      .select({
        id: schema.companies.id,
        name: schema.companies.name,
        description: schema.companies.description,
        isActive: schema.companies.isActive,
        createdBy: schema.companies.createdBy,
        createdAt: schema.companies.createdAt,
      })
      .from(schema.companies)
      .innerJoin(
        schema.companyUserAccess,
        and(
          eq(schema.companyUserAccess.companyId, schema.companies.id),
          eq(schema.companyUserAccess.userId, userId),
          eq(schema.companyUserAccess.canView, true),
        ),
      );
  }

  async findById(id: string, userId: string): Promise<Company> {
    const company = await this.getCompanyOrThrow(id);

    if (await this.isAdmin(userId)) {
      return company;
    }

    const hasViewAccess = await this.hasAccess(id, userId, "canView");
    if (!hasViewAccess) {
      throw new CompanyAccessDeniedError(id);
    }

    return company;
  }

  async create(input: CreateCompanyInput, createdBy: string): Promise<Company> {
    const [company] = await db
      .insert(schema.companies)
      .values({ name: input.name, description: input.description, createdBy })
      .returning();

    if (!company) {
      throw new Error(`Failed to create company: ${input.name}`);
    }

    await db
      .insert(schema.companyUserAccess)
      .values({ companyId: company.id, userId: createdBy, canView: true, canEdit: true });

    return company;
  }

  async update(id: string, input: UpdateCompanyInput): Promise<Company> {
    const [updatedCompany] = await db
      .update(schema.companies)
      .set({ name: input.name, description: input.description, isActive: input.isActive })
      .where(eq(schema.companies.id, id))
      .returning();

    if (!updatedCompany) {
      throw new CompanyNotFoundError(id);
    }

    return updatedCompany;
  }

  async updateAccess(
    companyId: string,
    userId: string,
    access: CompanyAccessInput,
  ): Promise<void> {
    await db
      .insert(schema.companyUserAccess)
      .values({ companyId, userId, canView: access.canView, canEdit: access.canEdit })
      .onConflictDoUpdate({
        target: [schema.companyUserAccess.companyId, schema.companyUserAccess.userId],
        set: { canView: access.canView, canEdit: access.canEdit },
      });
  }

  async getAccessList(companyId: string): Promise<CompanyAccessEntry[]> {
    return db
      .select({
        userId: schema.companyUserAccess.userId,
        canView: schema.companyUserAccess.canView,
        canEdit: schema.companyUserAccess.canEdit,
      })
      .from(schema.companyUserAccess)
      .where(eq(schema.companyUserAccess.companyId, companyId));
  }

  private async getCompanyOrThrow(id: string): Promise<Company> {
    const [company] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, id))
      .limit(1);

    if (!company) {
      throw new CompanyNotFoundError(id);
    }

    return company;
  }

  private async hasAccess(
    companyId: string,
    userId: string,
    field: "canView" | "canEdit",
  ): Promise<boolean> {
    const [access] = await db
      .select()
      .from(schema.companyUserAccess)
      .where(
        and(
          eq(schema.companyUserAccess.companyId, companyId),
          eq(schema.companyUserAccess.userId, userId),
        ),
      )
      .limit(1);

    return access?.[field] ?? false;
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    return user?.role === ADMIN_ROLE;
  }
}
