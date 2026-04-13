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
export enum NotificationType {
  info = "info",
  warning = "warning",
  error = "error",
}

// User information
export interface User {
  account: string;
  role: string;
  token: string;
}

export function userFromJson(json: Record<string, any>): User {
  return {
    account: json.account ?? "",
    role: json.role ?? "",
    token: json.token ?? "",
  };
}

// Server Configuration
export interface ServerConfig {
  ipAddress: string;
  port: string;
}

export function serverConfigFromJson(json: Record<string, any>): ServerConfig {
  return {
    ipAddress: json.ipAddress ?? "",
    port: json.port ?? "8088",
  };
}

export function getBaseUrl(config: ServerConfig): string {
  return `http://${config.ipAddress}:${config.port}`;
}

// Task information
export interface Task {
  taskId: string; // Unique identifier for the task
  taskName: string;
}

export function taskFromJson(json: Record<string, any>): Task {
  return {
    taskId: json.id ?? "",
    taskName: json.name ?? "",
  };
}

// Robot setting information
export interface RobotInfo {
  id: string; // Unique identifier for the robot
  name: string;
  group: string;
  model: string;
  ipAddress: string;
  mac: string;
  connected: boolean;
}

export function robotInfoFromJson(json: Record<string, any>): RobotInfo {
  return {
    id: json.id ?? "",
    name: json.name ?? "",
    group: json.group ?? "",
    model: json.model ?? "",
    ipAddress: json.ipAddress ?? "",
    mac: json.mac ?? "",
    connected: json.connected ?? false,
  };
}

// Robot status
export interface RobotStatus {
  id: string;
  ipAddress: string;
  mode: RobotMode;
  x?: number;
  y?: number;
  theta?: number;
  confidence?: number;
  emergency: boolean;
  status: string;
  battery: number;
  voltage?: number;
  current?: number;
  chargingMode: ChargingMode;
  currentTask?: string;
  currentTaskId?: string;
  taskState: TaskRunningState;
  online: boolean;
}

export function robotStatusFromJson(json: Record<string, any>): RobotStatus {
  const dataStatus = (json.dataStatus as Record<string, any>) ?? {};
  const taskStt = (dataStatus.taskStatus as Record<string, any>) ?? {};
  const curTask = (taskStt.currentTask as Record<string, any>) ?? {};

  const clamp = (value: number, max: number) =>
    Math.min(Math.max(0, value), max);

  return {
    id: json.id ?? "",
    ipAddress: json.ipAddress ?? "",
    mode: clamp(
      Number(dataStatus.mode ?? 0),
      Object.keys(RobotMode).length / 2 - 1,
    ) as RobotMode,
    x: Number(dataStatus.x ?? 0),
    y: Number(dataStatus.y ?? 0),
    theta: Number(dataStatus.angle ?? 0),
    confidence:
      dataStatus.confidence != null ? Number(dataStatus.confidence) : undefined,
    emergency: Boolean(dataStatus.emergency ?? false),
    battery: Number(dataStatus.batLevel ?? 0),
    voltage:
      dataStatus.voltage != null ? Number(dataStatus.voltage) : undefined,
    current:
      dataStatus.current != null ? Number(dataStatus.current) : undefined,
    chargingMode: clamp(
      Number(dataStatus.chargingMode ?? 0),
      Object.keys(ChargingMode).length / 2 - 1,
    ) as ChargingMode,
    currentTask: curTask.taskName ?? "",
    currentTaskId: curTask.taskId ?? "",
    taskState: clamp(
      Number(taskStt.state ?? 0),
      Object.keys(TaskRunningState).length / 2 - 1,
    ) as TaskRunningState,
    status: String(dataStatus.runningState ?? ""),
    online: true,
  };
}

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

// RequestOrder: Load/Store on device
export interface RequestOrder {
  id: string;
  taskId: string;
  taskName: string;
  priority: string;
  createdAt: string; // ISO string
}

export function requestOrderFromJson(json: Record<string, any>): RequestOrder {
  return {
    id: json.id ?? "",
    taskId: json.taskId ?? "",
    taskName: json.taskName ?? "",
    priority: json.priority ?? "0",
    createdAt: json.createdAt ?? new Date().toISOString(),
  };
}

// DemandOrder: Load/Store from CORE
export interface DemandOrder {
  taskId: string;
  taskName: string;
  createdAt: string;
}

export function demandOrderFromJson(json: Record<string, any>): DemandOrder {
  return {
    taskId: json.taskId ?? "",
    taskName: json.taskName ?? "",
    createdAt: json.createOn
      ? new Date(json.createOn).toISOString()
      : new Date().toISOString(),
  };
}

// QueueOrder a.k.a TaskRegistration: Load/Store from CORE
export interface QueueOrder {
  taskId: string;
  taskName: string;
  priority: number;
  createdAt: string;
}

export function queueOrderFromJson(json: Record<string, any>): QueueOrder {
  return {
    taskId: json.taskId ?? "",
    taskName: json.taskName ?? "",
    priority: Number(json.priority ?? 0),
    createdAt: json.createOn
      ? new Date(json.createOn).toISOString()
      : new Date().toISOString(),
  };
}

// RunningOrder a.k.a TaskExecuting: Load/Store from CORE
export interface RunningOrder {
  taskId: string;
  taskName: string;
  robotIp: string;
  robotName: string;
  createdOn: string;
  startOn: string;
}

export function runningOrderFromJson(json: Record<string, any>): RunningOrder {
  return {
    taskId: json.taskId ?? "",
    taskName: json.taskName ?? "",
    robotIp: json.robotIp ?? "",
    robotName: json.robotName ?? "",
    createdOn: json.createdOn
      ? new Date(json.createdOn).toISOString()
      : new Date().toISOString(),
    startOn: json.startOn
      ? new Date(json.startOn).toISOString()
      : new Date().toISOString(),
  };
}

export interface RecordOrder {
  taskId: string;
  taskName: string;
  status: string;
  robotIp?: string;
  robotName?: string;
  createdOn?: string;
}

export function recordOrderFromJson(json: Record<string, any>): RecordOrder {
  return {
    taskId: json.taskId ?? "",
    taskName: json.taskName ?? "",
    status: json.status ?? "",
    robotIp: json.robotIp,
    robotName: json.robotName,
    createdOn: json.createdOn
      ? new Date(json.createdOn).toISOString()
      : undefined,
  };
}

// Device Notifications
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
}

export function appNotificationFromJson(
  json: Record<string, any>,
): AppNotification {
  return {
    id: json.id ?? "",
    title: json.title ?? "",
    message: json.message ?? "",
    type: (Object.values(NotificationType).includes(json.type)
      ? json.type
      : NotificationType.info) as NotificationType,
    createdAt: json.createdAt ?? new Date().toISOString(),
  };
}

// WebSocket Events and Meta data
export interface WsMeta {
  code: number;
  createAt?: string;
  msg?: string;
}

export interface WsEvent {
  command: number;
  data?: Record<string, any>;
  meta?: WsMeta;
}

export function wsEventFromJson(json: Record<string, any>): WsEvent {
  return {
    command: json.command ?? -1,
    data:
      typeof json.data === "object" && !Array.isArray(json.data)
        ? json.data
        : undefined,
    meta:
      typeof json.meta === "object"
        ? {
            code: json.meta.code ?? -1,
            createAt: json.meta.createAt,
            msg: json.meta.msg,
          }
        : undefined,
  };
}

export function wsEventIsOk(event: WsEvent): boolean {
  return event.meta?.code === 0;
}

// RobotPose
export interface RobotPose {
  robotId: string;
  x: number;
  y: number;
  theta?: number;
  online: boolean;
}

export function robotPoseFromJson(json: Record<string, any>): RobotPose {
  return {
    robotId: String(json.robotId ?? json.id ?? ""),
    x: Number(json.x ?? 0),
    y: Number(json.y ?? 0),
    theta: json.theta != null ? Number(json.theta) : undefined,
    online: Boolean(json.online ?? json.connected ?? true),
  };
}
