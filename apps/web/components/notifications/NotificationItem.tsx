"use client";

import { AlertCircle, Bell, CreditCard, HardHat, Package } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import { formatTimeAgo } from "@/lib/format-time-ago";
import type { Notification, NotificationType } from "@/lib/mocks/notifications.mock";

const NOTIFICATION_ICONS: Record<NotificationType, ComponentType<{ className?: string }>> = {
  low_stock: Package,
  pending_payment: CreditCard,
  overdue_payable: AlertCircle,
  project_stage: HardHat,
  general: Bell,
};

interface NotificationItemProps {
  notification: Notification;
  onRead: (notificationId: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const NotificationIcon = NOTIFICATION_ICONS[notification.type];

  return (
    <Link
      href={notification.linkUrl}
      onClick={() => onRead(notification.id)}
      className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted/50"
    >
      <NotificationIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{notification.title}</span>
          {!notification.isRead ? <span className="size-2 shrink-0 rounded-full bg-brand" /> : null}
        </div>
        <span className="text-sm text-muted-foreground">{notification.body}</span>
        <span className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</span>
      </div>
    </Link>
  );
}
