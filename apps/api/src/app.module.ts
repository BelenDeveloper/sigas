import { Module } from "@nestjs/common";

import { CashModule } from "./cash/cash.module.js";
import { ClientsModule } from "./clients/clients.module.js";
import { CompaniesModule } from "./companies/companies.module.js";
import { HealthModule } from "./health/health.module.js";
import { InventoryModule } from "./inventory/inventory.module.js";
import { PurchasesModule } from "./purchases/purchases.module.js";
import { SalesModule } from "./sales/sales.module.js";
import { SuppliersModule } from "./suppliers/suppliers.module.js";
import { TrpcModule } from "./trpc/trpc.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    HealthModule,
    UsersModule,
    CompaniesModule,
    InventoryModule,
    ClientsModule,
    SuppliersModule,
    SalesModule,
    PurchasesModule,
    CashModule,
    TrpcModule,
  ],
})
export class AppModule {}
