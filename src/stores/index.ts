import { create } from "zustand";
import * as storage from "../services/storageService";
import * as api from "../services/apiService";
import { wsService, WsConnectionState } from "../services/websocketService";
import {
  User,
  ServerConfig,
  getBaseUrl,
  Task,
  RequestOrder,
  DemandOrder,
  QueueOrder,
  RunningOrder,
  RobotInfo,
  RobotStatus,
  makeOfflineRobotStatus,
  robotStatusFromJson,
  RecordOrder as TaskRecord,
  AppNotification,
  NotificationType,
  WsEvent,
  wsEventIsOk,
  RobotPose,
  robotPoseFromJson,
} from "../models";

// Authentication information
interface AuthState {
  user: User | null;
  serverConfig: ServerConfig | null;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  init: () => Promise<void>;
  login: (account: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setRememberMe: (value: boolean) => void;
  saveServerConfig: (ip: string, port: string) => Promise<void>;
  getSavedCredentials: () => Promise<{
    account: string;
    password: string;
  } | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  serverConfig: null,
  isLoading: false,
  error: null,
  rememberMe: false,

  async init() {
    const serverConfig = await storage.getServerConfig();
    const rememberMe = await storage.getRememberMe();
    const user = await storage.getUser();
    if (serverConfig) api.setBaseUrl(getBaseUrl(serverConfig));
    if (user) api.setToken(user.token);
    set({ serverConfig, rememberMe, user });
  },

  async login(account, password) {
    const { serverConfig } = get();
    set({ isLoading: true, error: null });
    try {
      if (!serverConfig) throw new Error("Server configuration not set");
      const resp = await api.login(account, password);
      const user: User = {
        account: resp.data.userName ?? "",
        role: resp.data.roleName ?? "",
        token: resp.data.token ?? "",
      };
      api.setToken(user.token);
      await storage.saveUser(user);
      const rememberMe = get().rememberMe;
      if (rememberMe) await storage.saveCredentials(account, password);
      else await storage.clearCredentials();
      set({ user, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  },

  async logout() {
    await storage.clearUser();
    if (!get().rememberMe) await storage.clearCredentials();
    api.setToken("");
    set({ user: null });
  },

  setRememberMe(value) {
    storage.setRememberMe(value);
    set({ rememberMe: value });
  },

  async saveServerConfig(ip, port) {
    const serverConfig: ServerConfig = { ipAddress: ip, port };
    await storage.saveServerConfig(serverConfig);
    api.setBaseUrl(getBaseUrl(serverConfig));
    set({ serverConfig });
  },

  async getSavedCredentials() {
    if (!get().rememberMe) return null;
    return storage.getCredentials();
  },
}));

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

export const useOrderStore = create<OrderState>((set, get) => ({
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

// Robot Store data
interface RobotState {
  robots: RobotInfo[];
  selectedRobot: RobotInfo | null;
  selectedRobotStatus: RobotStatus | null;
  records: TaskRecord[];
  selectedRecord: TaskRecord | null;
  isLoading: boolean;
  error: string | null;

  fetchRobots: () => Promise<void>;
  fetchRobotDetail: (id: string) => Promise<void>;
  fetchRecords: () => Promise<void>;
  fetchRecordDetail: (taskId: string) => Promise<void>;
  clearSelectedRobot: () => void;
  clearSelectedRecord: () => void;
}

export const useRobotStore = create<RobotState>((set) => ({
  robots: [],
  selectedRobot: null,
  selectedRobotStatus: null,
  records: [],
  selectedRecord: null,
  isLoading: false,
  error: null,

  async fetchRobots() {
    set({ isLoading: true, error: null });
    try {
      const robots = await api.getRobots();
      set({ robots, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  async fetchRobotDetail(id) {
    set({ isLoading: true, error: null });
    try {
      const status = await api.getRobotDetail(id);
      set({ selectedRobotStatus: status, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  async fetchRecords() {
    set({ isLoading: true, error: null });
    try {
      const records = await api.getRecordsOrder();
      set({ records, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  async fetchRecordDetail(taskId) {
    set({ isLoading: true, error: null });
    try {
      const record = await api.getRecordOderDetail(taskId);
      set({ selectedRecord: record, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  clearSelectedRobot() {
    set({ selectedRobot: null });
  },
  clearSelectedRecord() {
    set({ selectedRecord: null });
  },
}));

// Notification Store
interface NotificationState {
  notifications: AppNotification[];
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  isSelectAll: boolean;

  loadNotifications: () => Promise<void>;
  addNotification: (n: AppNotification) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  toggleSelectionMode: () => void;
  toggleNotificationSelection: (id: string) => void;
  selectAll: () => void;
  unselectAll: () => void;
  deleteSelected: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  selectedIds: new Set(),
  isSelectionMode: false,
  isSelectAll: false,

  async loadNotifications() {
    const notifications = await storage.getNotifications();
    set({ notifications });
  },

  async addNotification(n) {
    const notifications = [n, ...get().notifications];
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

// WebSocket Store
export const WsCommands = {
  getAutoResponseRobotStatus: 1000,
  robotConnectionChange: 1002,
  getRobotListStatus: 1004,
  getRobotStatusById: 1006,
} as const;

interface WsState {
  connectionState: WsConnectionState;
  robotPoses: Record<string, RobotPose>;
  allRobotStatus: Record<string, RobotStatus>;
  allRobotConnection: Record<string, boolean>;
  lastCommand: number | null;
  lastData: any;

  initRealtime: (wsUrl: string) => Promise<void>;
  disconnectRealtime: () => void;
  sendCommand: (command: number, data?: Record<string, any>) => void; // Send command to WebSocket
  getRobotPose: (id: string) => RobotPose | undefined;
  getRobotStatus: (id: string) => RobotStatus | undefined;
  getRobotConnection: (id: string) => boolean;
  setRobotConnection: (id: string, connected: boolean) => void;
}

let _stateUnsub: (() => void) | null = null;
let _eventUnsub: (() => void) | null = null;

export const useWsStore = create<WsState>((set, get) => ({
  connectionState: WsConnectionState.Disconnected,
  robotPoses: {},
  allRobotStatus: {},
  allRobotConnection: {},
  lastCommand: null,
  lastData: null,

  async initRealtime(wsUrl) {
    // Tear down previous subscriptions
    _stateUnsub?.();
    _eventUnsub?.();

    wsService.configure(wsUrl);

    _stateUnsub = wsService.onState((s) => set({ connectionState: s }));
    _eventUnsub = wsService.onEvent((event) => {
      if (!wsEventIsOk(event)) return;
      set({ lastCommand: event.command, lastData: event.data });
      const state = get();

      if (event.command === WsCommands.robotConnectionChange) {
        const change = event.data?.robotConnectionChange;
        if (change && change.id) {
          set({
            allRobotConnection: {
              ...state.allRobotConnection,
              [change.id]: Boolean(change.connected),
            },
          });
        }
      } else if (event.command === WsCommands.getRobotListStatus) {
        const list = event.data?.robotListStatus;
        if (!Array.isArray(list)) return;
        const poses = { ...state.robotPoses };
        const statuses = { ...state.allRobotStatus };
        for (const item of list) {
          if (!item || !item.id) continue;
          const robotId = String(item.id);
          const rs = robotStatusFromJson(item);
          statuses[robotId] = rs;
          poses[robotId] = {
            robotId,
            x: rs.x ?? 0,
            y: rs.y ?? 0,
            theta: rs.theta,
            online: true,
          };
        }
        set({ robotPoses: poses, allRobotStatus: statuses });
      } else if (event.command === WsCommands.getRobotStatusById) {
        if (event.data && typeof event.data === "object") {
          const rs = robotStatusFromJson(event.data);
          set({ allRobotStatus: { ...state.allRobotStatus, [rs.id]: rs } });
        }
      }
    });

    await wsService.connect();
  },

  disconnectRealtime() {
    _stateUnsub?.();
    _eventUnsub?.();
    wsService.disconnect();
  },

  sendCommand(command, data) {
    wsService.sendCommand(command, data);
  },

  getRobotPose(id) {
    return get().robotPoses[id];
  },
  getRobotStatus(id) {
    return get().allRobotStatus[id];
  },
  getRobotConnection(id) {
    return get().allRobotConnection[id] ?? false;
  },
  setRobotConnection(id, connected) {
    set((s) => ({
      allRobotConnection: { ...s.allRobotConnection, [id]: connected },
    }));
  },
}));

// Navigation screen index
export const NavIndex = {
  RequestOrderScreen: 0,
  DemandOrderScreen: 1,
  QueueOrderScreen: 2,
  RunningOrderScreen: 3,
  RecordOrderScreen: 4,
  RobotScreen: 5,
  MapScreen: 6,
  ProfileScreen: 7,
  SettingScreen: 8,
} as const;

// Bottom navigation state
// Stores the current and previous bottom nav tab.
interface NavState {
  index: number;
  previousIndex: number;
  setIndex: (i: number) => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  index: 0,
  previousIndex: -1,
  setIndex(i) {
    set({ previousIndex: get().index, index: i });
  },
}));
