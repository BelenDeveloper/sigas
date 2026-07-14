import { ListSkeleton } from "@/components/shared/ListSkeleton";
import type { Notification } from "@/lib/mocks/notifications.mock";

import { NotificationItem } from "./NotificationItem";

const NO_NOTIFICATIONS_MESSAGE = "No tienes notificaciones.";
const SKELETON_ITEMS = 4;
const SKELETON_ITEM_CLASS_NAME = "h-14 w-full";

interface NotificationListProps {
  notifications: Notification[];
  onRead: (notificationId: string) => void;
  isLoading: boolean;
}

export function NotificationList({ notifications, onRead, isLoading }: NotificationListProps) {
  if (isLoading) {
    return <ListSkeleton items={SKELETON_ITEMS} itemClassName={SKELETON_ITEM_CLASS_NAME} />;
  }

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
