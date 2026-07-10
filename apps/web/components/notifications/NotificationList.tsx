import type { Notification } from "@/lib/mocks/notifications.mock";

import { NotificationItem } from "./NotificationItem";

const NO_NOTIFICATIONS_MESSAGE = "No tienes notificaciones.";

interface NotificationListProps {
  notifications: Notification[];
  onRead: (notificationId: string) => void;
}

export function NotificationList({ notifications, onRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return <p className="text-sm text-muted-foreground">{NO_NOTIFICATIONS_MESSAGE}</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onRead={onRead} />
      ))}
    </div>
  );
}
