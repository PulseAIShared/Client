import { nanoid } from 'nanoid';
import { create } from 'zustand';

export type Notification = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
};

type NotificationsStore = {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id'>,
    autoDismiss?: boolean,
    duration?: number,
  ) => void;
  dismissNotification: (id: string) => void;
};

export const useNotifications = create<NotificationsStore>((set) => ({
  notifications: [],
  addNotification: (notification, autoDismiss = true, duration = 3000) => {
    const id = nanoid();
    set((state) => ({
      notifications: [...state.notifications, { id, ...notification }],
    }));

    if (autoDismiss) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id,
          ),
        }));
      }, duration);
    }
  },
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),
}));
