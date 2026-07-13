"use client";

import { supabase } from "@/lib/supabase-client";

const PROJECT_FILES_BUCKET = "project-files";

export type GetProjectUploadUrl = (
  fileName: string,
  contentType: string,
) => Promise<{ signedUrl: string; path: string; token: string }>;

export async function uploadProjectFile(file: File, getUploadUrl: GetProjectUploadUrl): Promise<string> {
  const { path, token } = await getUploadUrl(file.name, file.type);

  const { error } = await supabase.storage.from(PROJECT_FILES_BUCKET).uploadToSignedUrl(path, token, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return path;
}
