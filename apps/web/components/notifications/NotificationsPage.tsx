"use client";

import { Button } from "@repo/ui/components/ui/button";

import { useNotifications } from "@/hooks/use-notifications";

import { NotificationList } from "./NotificationList";

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Marcar todas como leídas
        </Button>
      </div>

      <NotificationList notifications={notifications} onRead={markAsRead} isLoading={isLoading} />
    </div>
  );
}
