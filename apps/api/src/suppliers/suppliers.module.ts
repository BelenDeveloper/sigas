import { Module } from "@nestjs/common";

import { SuppliersService } from "./suppliers.service.js";

@Module({
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
