import { Module } from "@nestjs/common";

import { PurchasesService } from "./purchases.service.js";

@Module({
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
