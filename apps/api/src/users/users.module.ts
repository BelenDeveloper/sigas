import { Module } from "@nestjs/common";

import { SupabaseModule } from "../supabase/supabase.module.js";
import { UsersService } from "./users.service.js";

@Module({
  imports: [SupabaseModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
