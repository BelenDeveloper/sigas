"use client";

import { useAtom } from "jotai";
import { useMemo } from "react";

import { notificationsAtom } from "@/lib/atoms/notifications.atom";
import type { Notification } from "@/lib/mocks/notifications.mock";

const RECENT_NOTIFICATIONS_LIMIT = 5;

interface UseNotificationsResult {
  notifications: Notification[];
  recentNotifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  const sortedNotifications = useMemo(
    () => [...notifications].sort((first, second) => (first.createdAt < second.createdAt ? 1 : -1)),
    [notifications],
  );

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) => previous.map((notification) => ({ ...notification, isRead: true })));
  };

  return {
    notifications: sortedNotifications,
    recentNotifications: sortedNotifications.slice(0, RECENT_NOTIFICATIONS_LIMIT),
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading: false,
  };
}
