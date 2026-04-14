import { create } from "zustand";
import * as storage from "../services/storageService";
import { wsService, WsConnectionState } from "../services/websocketService";
import {
  RobotStatus,
  robotStatusFromJson,
  RecordOrder as TaskRecord,
  AppNotification,
  NotificationType,
  WsEvent,
  wsEventIsOk,
  RobotPose,
} from "../models";

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

const useWsStore = create<WsState>((set, get) => ({
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

export default useWsStore;
