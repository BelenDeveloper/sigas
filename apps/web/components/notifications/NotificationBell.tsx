"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover";
import { Bell } from "lucide-react";
import Link from "next/link";

import { useNotifications } from "@/hooks/use-notifications";

import { NotificationItem } from "./NotificationItem";

const NOTIFICATIONS_ROUTE = "/notifications";
const MAX_BADGE_COUNT = 9;
const MAX_BADGE_COUNT_LABEL = "9+";
const NO_RECENT_NOTIFICATIONS_MESSAGE = "No tienes notificaciones recientes.";

export function NotificationBell() {
  const { recentNotifications, unreadCount, markAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" aria-label="Notificaciones" className="relative" />}
      >
        <Bell className="size-5 text-muted-foreground" />
        {unreadCount > 0 ? (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">
            {unreadCount > MAX_BADGE_COUNT ? MAX_BADGE_COUNT_LABEL : unreadCount}
          </Badge>
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="end" className="flex flex-col gap-2">
        {recentNotifications.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">{NO_RECENT_NOTIFICATIONS_MESSAGE}</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recentNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onRead={markAsRead} />
            ))}
          </div>
        )}

        <Link
          href={NOTIFICATIONS_ROUTE}
          className="rounded-md p-2 text-center text-sm font-medium text-brand hover:underline"
        >
          Ver todas
        </Link>
      </PopoverContent>
    </Popover>
  );
}
