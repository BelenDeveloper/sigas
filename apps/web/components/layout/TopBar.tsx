"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { SidebarTrigger } from "@repo/ui/components/ui/sidebar";
import { useAtomValue } from "jotai";
import { Bell, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { authUserAtom } from "@/lib/atoms/auth.atom";
import { MOCK_UNREAD_NOTIFICATIONS_COUNT } from "@/lib/mocks/notifications.mock";
import { ALL_NAV_ITEMS } from "@/lib/nav-items";

const DEFAULT_PAGE_TITLE = "Inicio";
const INITIALS_MAX_LENGTH = 2;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((namePart) => namePart[0])
    .join("")
    .slice(0, INITIALS_MAX_LENGTH)
    .toUpperCase();
}

function getPageTitle(pathname: string): string {
  const exactMatch = ALL_NAV_ITEMS.find((item) => item.href === pathname);
  if (exactMatch) {
    return exactMatch.label;
  }

  const nestedMatch = ALL_NAV_ITEMS.filter(
    (item) => item.href !== "/" && pathname.startsWith(`${item.href}/`),
  ).sort((first, second) => second.href.length - first.href.length)[0];

  return nestedMatch?.label ?? DEFAULT_PAGE_TITLE;
}

export function TopBar() {
  const pathname = usePathname();
  const authUser = useAtomValue(authUserAtom);
  const { logout } = useAuth();
  const hasUnreadNotifications = MOCK_UNREAD_NOTIFICATIONS_COUNT > 0;

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="size-5 text-muted-foreground" />
          {hasUnreadNotifications ? (
            <Badge className="absolute -top-2 -right-2 h-4 min-w-4 justify-center px-1 text-[10px]">
              {MOCK_UNREAD_NOTIFICATIONS_COUNT}
            </Badge>
          ) : null}
        </div>

        {authUser ? (
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback>{getInitials(authUser.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{authUser.name}</span>
          </div>
        ) : null}

        <Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesión">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
