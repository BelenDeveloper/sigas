import { Injectable } from "@nestjs/common";
import { db, schema } from "@repo/db";
import { eq } from "drizzle-orm";

import type { AuthUser } from "./users.types.js";

@Injectable()
export class UsersService {
  async findById(userId: string): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
