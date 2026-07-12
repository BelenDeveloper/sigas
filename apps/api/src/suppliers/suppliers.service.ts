import { Injectable } from "@nestjs/common";
import { db, schema, type Supplier } from "@repo/db";
import { and, eq, ilike, or } from "drizzle-orm";

import {
  SupplierNotFoundError,
  type CreateSupplierInput,
  type SupplierFilters,
  type UpdateSupplierInput,
} from "./suppliers.types.js";

@Injectable()
export class SuppliersService {
  async findAll(filters: SupplierFilters): Promise<Supplier[]> {
    const conditions = [];

    if (!filters.showInactive) {
      conditions.push(eq(schema.suppliers.isActive, true));
    }

    if (filters.country) {
      conditions.push(eq(schema.suppliers.country, filters.country));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(schema.suppliers.companyName, searchPattern),
          ilike(schema.suppliers.nit, searchPattern),
        ),
      );
    }

    const query = db.select().from(schema.suppliers).orderBy(schema.suppliers.companyName);

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  }

  async findById(id: string): Promise<Supplier> {
    const [supplier] = await db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.id, id))
      .limit(1);

    if (!supplier) {
      throw new SupplierNotFoundError(id);
    }

    return supplier;
  }

  async create(input: CreateSupplierInput, createdBy: string): Promise<Supplier> {
    const [supplier] = await db
      .insert(schema.suppliers)
      .values({
        companyName: input.companyName,
        contactName: input.contactName,
        nit: input.nit,
        phone: input.phone,
        email: input.email,
        address: input.address,
        city: input.city,
        country: input.country,
        notes: input.notes,
        createdBy,
      })
      .returning();

    if (!supplier) {
      throw new Error(`Failed to create supplier: ${input.companyName}`);
    }

    return supplier;
  }

  async update(id: string, input: UpdateSupplierInput): Promise<Supplier> {
    const [updatedSupplier] = await db
      .update(schema.suppliers)
      .set({
        companyName: input.companyName,
        contactName: input.contactName,
        nit: input.nit,
        phone: input.phone,
        email: input.email,
        address: input.address,
        city: input.city,
        country: input.country,
        notes: input.notes,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(schema.suppliers.id, id))
      .returning();

    if (!updatedSupplier) {
      throw new SupplierNotFoundError(id);
    }

    return updatedSupplier;
  }

  async toggleActive(id: string): Promise<Supplier> {
    const [supplier] = await db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.id, id))
      .limit(1);

    if (!supplier) {
      throw new SupplierNotFoundError(id);
    }

    const [updatedSupplier] = await db
      .update(schema.suppliers)
      .set({ isActive: !supplier.isActive, updatedAt: new Date() })
      .where(eq(schema.suppliers.id, id))
      .returning();

    if (!updatedSupplier) {
      throw new Error(`Failed to toggle active state for supplier: ${id}`);
    }

    return updatedSupplier;
  }
}
