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

const useRobotStore = create<RobotState>((set) => ({
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

export default useRobotStore;
