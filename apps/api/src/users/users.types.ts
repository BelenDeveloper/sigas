import type { UserRole } from "@repo/db";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
