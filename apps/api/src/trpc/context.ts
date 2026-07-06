import type { INestApplicationContext } from "@nestjs/common";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";

export interface Context {
  req: Request;
  res: Response;
  app: INestApplicationContext;
}

export function createContextFactory(app: INestApplicationContext) {
  return ({ req, res }: CreateExpressContextOptions): Context => ({ req, res, app });
}
