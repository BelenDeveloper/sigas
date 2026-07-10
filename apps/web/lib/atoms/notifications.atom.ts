import { atom } from "jotai";

import { MOCK_NOTIFICATIONS, type Notification } from "@/lib/mocks/notifications.mock";

export const notificationsAtom = atom<Notification[]>(MOCK_NOTIFICATIONS);
