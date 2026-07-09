"use client";

import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/nav-items";

const ACTIVE_HOVER_CLASSES =
  "hover:bg-brand hover:text-brand-foreground data-active:bg-brand data-active:text-brand-foreground data-active:hover:bg-brand/90";

interface SidebarNavItemProps {
  item: NavItem;
  badgeCount?: number;
}

export function SidebarNavItem({ item, badgeCount }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;
  const hasBadge = typeof badgeCount === "number" && badgeCount > 0;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.href} />}
        isActive={isActive}
        tooltip={item.label}
        className={ACTIVE_HOVER_CLASSES}
      >
        <Icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
      {hasBadge ? <SidebarMenuBadge>{badgeCount}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  );
}
