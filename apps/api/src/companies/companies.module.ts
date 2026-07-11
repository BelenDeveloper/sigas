import { Module } from "@nestjs/common";

import { CompaniesService } from "./companies.service.js";

@Module({
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
