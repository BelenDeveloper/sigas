"use client";

import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { authUserAtom } from "@/lib/atoms/auth.atom";

const LOGIN_ROUTE = "/login";

export function DashboardPage() {
  const router = useRouter();
  const authUser = useAtomValue(authUserAtom);

  useEffect(() => {
    if (!authUser) {
      router.replace(LOGIN_ROUTE);
    }
  }, [authUser, router]);

  if (!authUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <p className="text-lg font-medium text-foreground">Welcome, {authUser.name}.</p>
    </div>
  );
}
