import { create } from "zustand";

type Notification = {
  id: string;
  title: string;
  message: string;
};

type NotificationState = {
  notifications: Notification[];
  notificationCount: number;
  addNotification: (title: any, message: any) => void;
  removeNotification: (id: any) => void;
  clearNotifications: () => void;
};

const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  notificationCount: 0,
  addNotification: (title, message) =>
    set((state) => ({
      notifications: [{ id: Date.now().toString(), title, message }, ...state.notifications],
      notificationCount: state.notificationCount + 1,
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
      notificationCount: Math.max(0, state.notificationCount - 1),
    })),
  clearNotifications: () => set({ notifications: [], notificationCount: 0 }),
}));

export default useNotificationStore;
