import { create } from "zustand";
import * as storage from "../services/storageService";
import {
  RecordOrder as TaskRecord,
  AppNotification,
  NotificationType,
} from "../models";

// Notification Store
interface NotificationState {
  notifications: AppNotification[];
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  isSelectAll: boolean;

  loadNotifications: () => Promise<void>;
  addNotification: (notification: AppNotification) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  toggleSelectionMode: () => void;
  toggleNotificationSelection: (id: string) => void;
  selectAll: () => void;
  unselectAll: () => void;
  deleteSelected: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  selectedIds: new Set(),
  isSelectionMode: false,
  isSelectAll: false,

  async loadNotifications() {
    const notifications = await storage.getNotifications();
    set({ notifications });
  },

  async addNotification(notification) {
    const notifications = [notification, ...get().notifications];
    await storage.saveNotifications(notifications);
    set({ notifications });
  },

  async deleteNotification(id) {
    const notifications = get().notifications.filter((n) => n.id !== id);
    await storage.saveNotifications(notifications);
    set({ notifications });
  },

  toggleSelectionMode() {
    const wasOn = get().isSelectionMode;
    set({
      isSelectionMode: !wasOn,
      selectedIds: wasOn ? new Set() : get().selectedIds,
    });
  },

  toggleNotificationSelection(id) {
    const ids = new Set(get().selectedIds);
    ids.has(id) ? ids.delete(id) : ids.add(id);
    set({ selectedIds: ids });
  },

  selectAll() {
    const ids = new Set(get().notifications.map((n) => n.id));
    set({ selectedIds: ids, isSelectAll: true });
  },

  unselectAll() {
    set({ selectedIds: new Set(), isSelectAll: false });
  },

  async deleteSelected() {
    const { selectedIds, notifications } = get();
    const next = notifications.filter((n) => !selectedIds.has(n.id));
    await storage.saveNotifications(next);
    set({
      notifications: next,
      selectedIds: new Set(),
      isSelectionMode: false,
      isSelectAll: false,
    });
  },

  async clearAll() {
    await storage.saveNotifications([]);
    set({
      notifications: [],
      selectedIds: new Set(),
      isSelectionMode: false,
      isSelectAll: false,
    });
  },
}));

export default useNotificationStore;
