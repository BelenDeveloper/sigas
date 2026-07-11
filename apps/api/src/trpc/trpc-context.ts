import type { INestApplicationContext } from "@nestjs/common";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { UsersService } from "../users/users.service.js";
import type { UserWithPermissions } from "../users/users.types.js";

const BEARER_PREFIX = "Bearer ";

export interface TrpcContext {
  user: UserWithPermissions | null;
}

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is not set");
}

const jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));

interface CreateTrpcContextOptions extends CreateExpressContextOptions {
  app: INestApplicationContext;
}

export async function createTrpcContext({
  req,
  app,
}: CreateTrpcContextOptions): Promise<TrpcContext> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith(BEARER_PREFIX)) {
    return { user: null };
  }

  try {
    const token = authHeader.slice(BEARER_PREFIX.length);
    const { payload } = await jwtVerify(token, jwks);

    if (!payload.sub) {
      return { user: null };
    }

    const usersService = app.get(UsersService);
    const user = await usersService.findById(payload.sub);
    return { user };
  } catch {
    return { user: null };
  }
}

export function createTrpcContextFactory(app: INestApplicationContext) {
  return (opts: CreateExpressContextOptions): Promise<TrpcContext> =>
    createTrpcContext({ ...opts, app });
}
