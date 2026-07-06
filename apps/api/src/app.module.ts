import { Module } from "@nestjs/common";

import { HealthModule } from "./health/health.module.js";
import { TrpcModule } from "./trpc/trpc.module.js";

@Module({
  imports: [HealthModule, TrpcModule],
})
export class AppModule {}
