"use client";

import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { isAuthenticatedAtom } from "@/lib/atoms/auth.atom";

const LOGIN_ROUTE = "/login";
const DASHBOARD_ROUTE = "/dashboard";

export function HomeRedirect() {
  const router = useRouter();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  useEffect(() => {
    router.replace(isAuthenticated ? DASHBOARD_ROUTE : LOGIN_ROUTE);
  }, [isAuthenticated, router]);

  return null;
}
