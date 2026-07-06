"use client";

import { trpc } from "../../lib/trpc/client";

export function ApiStatus() {
  const { data, isPending, isError } = trpc.health.check.useQuery();

  if (isPending) return <p>Checking API connection…</p>;
  if (isError) return <p>API unreachable. Is apps/api running on the expected port?</p>;

  return (
    <p>
      API: {data.status} · Database: {data.database}
    </p>
  );
}
