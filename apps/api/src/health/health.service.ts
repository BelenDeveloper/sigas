import { Injectable } from "@nestjs/common";
import { db } from "@repo/db";
import { sql } from "drizzle-orm";

@Injectable()
export class HealthService {
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }
}
