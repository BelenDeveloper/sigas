import { Injectable } from "@nestjs/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseAdminService {
  readonly client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }

    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async createSignedUploadUrl(
    bucket: string,
    path: string,
  ): Promise<{ signedUrl: string; path: string; token: string }> {
    const { data, error } = await this.client.storage.from(bucket).createSignedUploadUrl(path);

    if (error || !data) {
      throw new Error(`Failed to create signed upload URL: ${error?.message ?? "unknown error"}`);
    }

    return data;
  }
}
