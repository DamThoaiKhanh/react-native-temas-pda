import { z } from "zod";

// Enums
export enum ChargingMode {
  free = 0,
  auto = 1,
  manual = 2,
}

export enum RobotMode {
  auto = 0,
  manual = 1,
}

export enum TaskRunningState {
  stopped = 0,
  running = 1,
  paused = 2,
  continuing = 3,
  ending = 4,
}

// // Robot setting information
// export interface RobotInfo {
//   id: string; // Unique identifier for the robot
//   name: string;
//   group: string;
//   model: string;
//   ipAddress: string;
//   mac: string;
//   connected: boolean;
// }

// export function robotInfoFromJson(json: Record<string, any>): RobotInfo {
//   return {
//     id: json.id ?? "",
//     name: json.name ?? "",
//     group: json.group ?? "",
//     model: json.model ?? "",
//     ipAddress: json.ipAddress ?? "",
//     mac: json.mac ?? "",
//     connected: json.connected ?? false,
//   };
// }

// Robot setting information
export const RobotInfoSchema = z.object({
  id: z.string().default(""),
  name: z.string().default(""),
  group: z.string().default(""),
  model: z.string().default(""),
  ipAddress: z.string().default(""),
  mac: z.string().default(""),
  connected: z.boolean().default(false),
});

export type RobotInfo = z.infer<typeof RobotInfoSchema>;

export function robotInfoFromJson(json: unknown): RobotInfo {
  return RobotInfoSchema.parse(json);
}

// // Robot status
// export interface RobotStatus {
//   id: string;
//   ipAddress: string;
//   mode: RobotMode;
//   x?: number;
//   y?: number;
//   theta?: number;
//   confidence?: number;
//   emergency: boolean;
//   status: string;
//   battery: number;
//   voltage?: number;
//   current?: number;
//   chargingMode: ChargingMode;
//   currentTask?: string;
//   currentTaskId?: string;
//   taskState: TaskRunningState;
//   online: boolean;
// }

// export function robotStatusFromJson(json: Record<string, any>): RobotStatus {
//   const dataStatus = (json.dataStatus as Record<string, any>) ?? {};
//   const taskStt = (dataStatus.taskStatus as Record<string, any>) ?? {};
//   const curTask = (taskStt.currentTask as Record<string, any>) ?? {};

//   const clamp = (value: number, max: number) =>
//     Math.min(Math.max(0, value), max);

//   return {
//     id: json.id ?? "",
//     ipAddress: json.ipAddress ?? "",
//     mode: clamp(
//       Number(dataStatus.mode ?? 0),
//       Object.keys(RobotMode).length / 2 - 1,
//     ) as RobotMode,
//     x: Number(dataStatus.x ?? 0),
//     y: Number(dataStatus.y ?? 0),
//     theta: Number(dataStatus.angle ?? 0),
//     confidence:
//       dataStatus.confidence != null ? Number(dataStatus.confidence) : undefined,
//     emergency: Boolean(dataStatus.emergency ?? false),
//     battery: Number(dataStatus.batLevel ?? 0),
//     voltage:
//       dataStatus.voltage != null ? Number(dataStatus.voltage) : undefined,
//     current:
//       dataStatus.current != null ? Number(dataStatus.current) : undefined,
//     chargingMode: clamp(
//       Number(dataStatus.chargingMode ?? 0),
//       Object.keys(ChargingMode).length / 2 - 1,
//     ) as ChargingMode,
//     currentTask: curTask.taskName ?? "",
//     currentTaskId: curTask.taskId ?? "",
//     taskState: clamp(
//       Number(taskStt.state ?? 0),
//       Object.keys(TaskRunningState).length / 2 - 1,
//     ) as TaskRunningState,
//     status: String(dataStatus.runningState ?? ""),
//     online: true,
//   };
// }

// export function makeOfflineRobotStatus(): RobotStatus {
//   return {
//     id: "AMR001",
//     ipAddress: "127.0.0.1",
//     mode: RobotMode.manual,
//     x: 0,
//     y: 0,
//     theta: 0,
//     confidence: 0,
//     emergency: true,
//     battery: 0,
//     voltage: 0,
//     current: 0,
//     chargingMode: ChargingMode.free,
//     currentTask: "",
//     currentTaskId: "",
//     taskState: TaskRunningState.stopped,
//     status: "Offline",
//     online: false,
//   };
// }

// Task information
// export interface Task {
//   taskId: string; // Unique identifier for the task
//   taskName: string;
// }

// export function taskFromJson(json: Record<string, any>): Task {
//   return {
//     taskId: json.id ?? "",
//     taskName: json.name ?? "",
//   };
// }

// Robot status
const TaskSchema = z.object({
  taskName: z.string().default(""),
  taskId: z.string().default(""),
});

const TaskStatusSchema = z.object({
  currentTask: TaskSchema.default({
    taskName: "",
    taskId: "",
  }),
  state: z.coerce.number().default(0),
});

const DataStatusSchema = z.object({
  mode: z.coerce.number().default(0),
  x: z.coerce.number().default(0),
  y: z.coerce.number().default(0),
  angle: z.coerce.number().default(0),
  confidence: z.coerce.number().optional(),
  emergency: z.coerce.boolean().default(false),
  batLevel: z.coerce.number().default(0),
  voltage: z.coerce.number().optional(),
  current: z.coerce.number().optional(),
  chargingMode: z.coerce.number().default(0),
  runningState: z.coerce.string().default(""),
  taskStatus: TaskStatusSchema.default({
    currentTask: {
      taskName: "",
      taskId: "",
    },
    state: 0,
  }),
});

const RawRobotStatusSchema = z.object({
  id: z.string().default(""),
  ipAddress: z.string().default(""),
  dataStatus: DataStatusSchema.default({
    mode: 0,
    x: 0,
    y: 0,
    angle: 0,
    confidence: undefined,
    emergency: false,
    batLevel: 0,
    voltage: undefined,
    current: undefined,
    chargingMode: 0,
    runningState: "",
    taskStatus: {
      currentTask: {
        taskName: "",
        taskId: "",
      },
      state: 0,
    },
  }),
});

export const RobotStatusSchema = RawRobotStatusSchema.transform((raw) => {
  const ds = raw.dataStatus;
  const ts = ds.taskStatus;
  const ct = ts.currentTask;

  return {
    id: raw.id,
    ipAddress: raw.ipAddress,
    mode: Math.min(Math.max(0, ds.mode), 1) as RobotMode,
    x: ds.x,
    y: ds.y,
    theta: ds.angle,
    confidence: ds.confidence,
    emergency: ds.emergency,
    battery: ds.batLevel,
    voltage: ds.voltage,
    current: ds.current,
    chargingMode: Math.min(Math.max(0, ds.chargingMode), 2) as ChargingMode,
    currentTask: ct.taskName,
    currentTaskId: ct.taskId,
    taskState: Math.min(Math.max(0, ts.state), 4) as TaskRunningState,
    status: ds.runningState,
    online: true,
  };
});

export type RobotStatus = z.infer<typeof RobotStatusSchema>;

export function robotStatusFromJson(json: unknown): RobotStatus {
  return RobotStatusSchema.parse(json);
}

// Offline fallback
export function makeOfflineRobotStatus(): RobotStatus {
  return {
    id: "AMR001",
    ipAddress: "127.0.0.1",
    mode: RobotMode.manual,
    x: 0,
    y: 0,
    theta: 0,
    confidence: 0,
    emergency: true,
    battery: 0,
    voltage: 0,
    current: 0,
    chargingMode: ChargingMode.free,
    currentTask: "",
    currentTaskId: "",
    taskState: TaskRunningState.stopped,
    status: "Offline",
    online: false,
  };
}

// RobotPose
export const RobotPoseSchema = z.object({
  robotId: z.coerce.string().default(""),
  x: z.coerce.number().default(0),
  y: z.coerce.number().default(0),
  theta: z.coerce.number().optional(),
  online: z.coerce.boolean().default(true),
});

export type RobotPose = z.infer<typeof RobotPoseSchema>;

export function robotPoseFromJson(json: unknown): RobotPose {
  return RobotPoseSchema.parse(json);
}
