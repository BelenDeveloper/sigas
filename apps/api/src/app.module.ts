import { Module } from "@nestjs/common";

import { HealthModule } from "./health/health.module.js";
import { TrpcModule } from "./trpc/trpc.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [HealthModule, UsersModule, TrpcModule],
})
export class AppModule {}
