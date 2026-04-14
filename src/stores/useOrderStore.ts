import { create } from "zustand";
import * as storage from "../services/storageService";
import * as api from "../services/apiService";
import { wsService, WsConnectionState } from "../services/websocketService";
import {
  Task,
  RequestOrder,
  DemandOrder,
  QueueOrder,
  RunningOrder,
  RecordOrder as TaskRecord,
} from "../models";

// Order Store fetch from CORE
interface OrderState {
  requestOrders: RequestOrder[];
  queueOrders: QueueOrder[];
  demandOrders: DemandOrder[];
  runningOrders: RunningOrder[];
  availableTasks: Task[]; // Task list from CORE
  isLoading: boolean;
  error: string | null;

  loadRequestOrders: (account: string) => Promise<void>;
  addRequestOrder: (account: string, order: RequestOrder) => Promise<void>;
  updateRequestOrder: (
    account: string,
    id: string,
    order: RequestOrder,
  ) => Promise<void>;
  deleteRequestOrder: (account: string, id: string) => Promise<void>;
  sendRequestOrder: (order: RequestOrder) => Promise<boolean>;
  fetchAvailableTasks: () => Promise<void>;
  fetchDemandOrders: () => Promise<void>;
  confirmDemandOrder: (taskId: string) => Promise<boolean>;
  deleteDemandOrder: (taskId: string) => Promise<boolean>;
  fetchQueueOrders: () => Promise<void>;
  fetchRunningOrders: () => Promise<void>;
  cancelRunningOrder: (taskId: string) => Promise<boolean>;
}

const useOrderStore = create<OrderState>((set, get) => ({
  requestOrders: [],
  queueOrders: [],
  demandOrders: [],
  runningOrders: [],
  availableTasks: [],
  isLoading: false,
  error: null,

  async loadRequestOrders(account) {
    const orders = await storage.getRequestOrders(account);
    set({ requestOrders: orders });
  },

  async addRequestOrder(account, order) {
    const orders = [...get().requestOrders, order];
    await storage.saveRequestOrders(account, orders);
    set({ requestOrders: orders });
  },

  async updateRequestOrder(account, id, updated) {
    const orders = get().requestOrders.map((o) => (o.id === id ? updated : o));
    await storage.saveRequestOrders(account, orders);
    set({ requestOrders: orders });
  },

  async deleteRequestOrder(account, id) {
    const orders = get().requestOrders.filter((o) => o.id !== id);
    await storage.saveRequestOrders(account, orders);
    set({ requestOrders: orders });
  },

  async sendRequestOrder(order) {
    set({ isLoading: true, error: null });
    try {
      await api.sendRequestOrder(order);
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  },

  // Get task list from CORE
  async fetchAvailableTasks() {
    set({ isLoading: true, error: null });
    try {
      const tasks = await api.getTasks();
      set({ availableTasks: tasks, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  async fetchDemandOrders() {
    set({ isLoading: true, error: null });
    try {
      const orders = await api.getDemandOrders();
      set({ demandOrders: orders, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  // Confirm demand order, then re-fetch current demand orders to update the list
  async confirmDemandOrder(taskId) {
    set({ isLoading: true, error: null });
    try {
      await api.confirmDemandOrder(taskId);
      await get().fetchDemandOrders();
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  },

  async deleteDemandOrder(taskId) {
    set({ isLoading: true, error: null });
    try {
      await api.deleteDemandOrder(taskId);
      set((state) => ({
        demandOrders: state.demandOrders.filter(
          (order) => order.taskId !== taskId,
        ),
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  },

  // Get registered orders from CORE
  async fetchQueueOrders() {
    set({ isLoading: true, error: null });
    try {
      const orders = await api.getQueueOrders();
      set({ queueOrders: orders, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  // Get executing orders from CORE
  async fetchRunningOrders() {
    set({ isLoading: true, error: null });
    try {
      const orders = await api.getRunningOrders();
      set({ runningOrders: orders, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  // Cancel executing order, then update the list
  async cancelRunningOrder(taskId) {
    set({ isLoading: true, error: null });
    try {
      await api.cancelRunningOrder(taskId);
      set((state) => ({
        runningOrders: state.runningOrders.filter(
          (order) => order.taskId !== taskId,
        ),
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  },
}));

export default useOrderStore;
