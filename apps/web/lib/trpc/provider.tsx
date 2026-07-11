"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";

import { supabase } from "@/lib/supabase-client";

import { trpc } from "./client";

const DEFAULT_API_URL = "http://localhost:4000";

interface TrpcProviderProps {
  children: React.ReactNode;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return {};
  }

  return { Authorization: `Bearer ${data.session.access_token}` };
}

export function TrpcProvider({ children }: TrpcProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL}/trpc`,
          headers: getAuthHeaders,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
