import type { INestApplication } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { HealthModule } from "../health/health.module.js";
import { UsersModule } from "../users/users.module.js";
import { createTrpcContextFactory } from "./trpc-context.js";
import { appRouter } from "./trpc.router.js";

@Module({
  imports: [HealthModule, UsersModule],
})
export class TrpcModule {
  static applyMiddleware(app: INestApplication): void {
    app.use(
      "/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext: createTrpcContextFactory(app),
      }),
    );
  }
}
