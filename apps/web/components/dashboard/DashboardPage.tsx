"use client";

import { useAtomValue } from "jotai";

import { authUserAtom } from "@/lib/atoms/auth.atom";

export function DashboardPage() {
  const authUser = useAtomValue(authUserAtom);

  return <p className="text-lg font-medium text-foreground">Bienvenido, {authUser?.name}.</p>;
}
