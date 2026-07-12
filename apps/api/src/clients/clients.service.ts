import { Injectable } from "@nestjs/common";
import { db, schema, type Client } from "@repo/db";
import { and, eq, ilike, or } from "drizzle-orm";

import {
  ClientNotFoundError,
  type ClientFilters,
  type CreateClientInput,
  type UpdateClientInput,
} from "./clients.types.js";

@Injectable()
export class ClientsService {
  async findAll(filters: ClientFilters): Promise<Client[]> {
    const conditions = [];

    if (filters.city) {
      conditions.push(eq(schema.clients.city, filters.city));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(schema.clients.name, searchPattern),
          ilike(schema.clients.documentNumber, searchPattern),
        ),
      );
    }

    const query = db.select().from(schema.clients).orderBy(schema.clients.name);

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  }

  // Sale history summary (totalSales, totalPaid, totalPending) will be joined in
  // once the Sales module exists — see getClientDebt.
  async findById(id: string): Promise<Client> {
    const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1);

    if (!client) {
      throw new ClientNotFoundError(id);
    }

    return client;
  }

  async create(input: CreateClientInput, createdBy: string): Promise<Client> {
    const [client] = await db
      .insert(schema.clients)
      .values({
        name: input.name,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        phone: input.phone,
        email: input.email,
        address: input.address,
        neighborhood: input.neighborhood,
        city: input.city,
        notes: input.notes,
        createdBy,
      })
      .returning();

    if (!client) {
      throw new Error(`Failed to create client: ${input.name}`);
    }

    return client;
  }

  async update(id: string, input: UpdateClientInput): Promise<Client> {
    const [updatedClient] = await db
      .update(schema.clients)
      .set({
        name: input.name,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        phone: input.phone,
        email: input.email,
        address: input.address,
        neighborhood: input.neighborhood,
        city: input.city,
        notes: input.notes,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(schema.clients.id, id))
      .returning();

    if (!updatedClient) {
      throw new ClientNotFoundError(id);
    }

    return updatedClient;
  }

  async toggleActive(id: string): Promise<Client> {
    const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1);

    if (!client) {
      throw new ClientNotFoundError(id);
    }

    const [updatedClient] = await db
      .update(schema.clients)
      .set({ isActive: !client.isActive, updatedAt: new Date() })
      .where(eq(schema.clients.id, id))
      .returning();

    if (!updatedClient) {
      throw new Error(`Failed to toggle active state for client: ${id}`);
    }

    return updatedClient;
  }
}
