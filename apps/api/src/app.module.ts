import { Module } from "@nestjs/common";

import { ClientsModule } from "./clients/clients.module.js";
import { CompaniesModule } from "./companies/companies.module.js";
import { HealthModule } from "./health/health.module.js";
import { InventoryModule } from "./inventory/inventory.module.js";
import { TrpcModule } from "./trpc/trpc.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [HealthModule, UsersModule, CompaniesModule, InventoryModule, ClientsModule, TrpcModule],
})
export class AppModule {}
