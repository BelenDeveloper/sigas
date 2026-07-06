import type { INestApplication } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { HealthModule } from "../health/health.module.js";
import { createContextFactory } from "./context.js";
import { appRouter } from "./routers/index.js";

@Module({
  imports: [HealthModule],
})
export class TrpcModule {
  static applyMiddleware(app: INestApplication): void {
    app.use(
      "/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext: createContextFactory(app),
      }),
    );
  }
}
