"use client";

import { useAtom } from "jotai";

import { sidebarCollapsedAtom } from "@/lib/atoms/sidebar.atom";

interface UseSidebarResult {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  toggleSidebar: () => void;
}

export function useSidebar(): UseSidebarResult {
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return { isCollapsed, setIsCollapsed, toggleSidebar };
}
