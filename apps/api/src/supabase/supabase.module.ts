import { Module } from "@nestjs/common";

import { SupabaseAdminService } from "./supabase.service.js";

@Module({
  providers: [SupabaseAdminService],
  exports: [SupabaseAdminService],
})
export class SupabaseModule {}
