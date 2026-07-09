"use client";

import { useAtomValue } from "jotai";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarSeparator,
} from "@repo/ui/components/ui/sidebar";

import { authUserAtom } from "@/lib/atoms/auth.atom";
import { MOCK_UNREAD_NOTIFICATIONS_COUNT } from "@/lib/mocks/notifications.mock";
import {
  NOTIFICATIONS_NAV_ITEM,
  PRIMARY_NAV_ITEMS,
  SETTINGS_NAV_ITEMS,
} from "@/lib/nav-items";

import { SidebarBrand } from "./SidebarBrand";
import { SidebarNavItem } from "./SidebarNavItem";

const ADMIN_ROLE = "admin";

export function Sidebar() {
  const authUser = useAtomValue(authUserAtom);
  const isAdmin = authUser?.role === ADMIN_ROLE;

  const visibleSettingsNavItems = SETTINGS_NAV_ITEMS.filter(
    (item) => !item.isAdminOnly || isAdmin,
  );

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarBrand />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {PRIMARY_NAV_ITEMS.map((item) => (
              <SidebarNavItem key={item.href} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarNavItem
              item={NOTIFICATIONS_NAV_ITEM}
              badgeCount={MOCK_UNREAD_NOTIFICATIONS_COUNT}
            />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarMenu>
            {visibleSettingsNavItems.map((item) => (
              <SidebarNavItem key={item.href} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  );
}
