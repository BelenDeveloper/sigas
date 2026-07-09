"use client";

import { SidebarInset, SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSidebar } from "@/hooks/use-sidebar";
import { authUserAtom } from "@/lib/atoms/auth.atom";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const LOGIN_ROUTE = "/login";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const authUser = useAtomValue(authUserAtom);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  useEffect(() => {
    if (!authUser) {
      router.replace(LOGIN_ROUTE);
    }
  }, [authUser, router]);

  if (!authUser) {
    return null;
  }

  return (
    <TooltipProvider>
      <SidebarProvider
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <Sidebar />
        <SidebarInset className="flex flex-col">
          <TopBar />
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
