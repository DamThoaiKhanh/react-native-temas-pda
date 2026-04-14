import {
  Task,
  taskFromJson,
  RequestOrder,
  DemandOrder,
  demandOrderFromJson,
  QueueOrder,
  queueOrderFromJson,
  RunningOrder,
  runningOrderFromJson,
  RecordOrder,
  recordOrderFromJson,
  RobotInfo,
  robotInfoFromJson,
  RobotStatus,
  RobotMode,
  TaskRunningState,
  ChargingMode,
} from "../models";

// Server URL and Auth Token Management
let _baseUrl = "";
let _token = "";

export function setBaseUrl(url: string): void {
  _baseUrl = url;
}

export function getBaseUrl(): string {
  return _baseUrl;
}

export function setToken(token: string): void {
  _token = token;
}

// Request Wrapper
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${_baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  // console.log(`API ${options.method ?? "GET"} ${path} => ${res.status}`);
  if (res.status === 401) {
    // clear token, navigate to login
    // useAuthStore.getState().logout();
    throw new Error("Unauthorized. Please login again.");
  }

  if (res.status === 500) {
    // server error — show user friendly message
    throw new Error("Server internal error. Please try again later.");
  }

  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

// Login with credentials (account, password) to get token
export async function login(
  account: string,
  password: string,
): Promise<Record<string, any>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${_baseUrl}/api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: account, password }),
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Invalid account or password");
      throw new Error(`Login failed (${res.status})`);
    }
    return res.json();
  } catch (e: any) {
    if (e.name === "AbortError") throw new Error("Login request timed out");
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateToken(): Promise<boolean> {
  try {
    const res = await request<any>("/api/v1/auth/verify");
    return res.meta?.code === 0;
  } catch {
    return false;
  }
}

// Get tasks list
export async function getTasks(): Promise<Task[]> {
  const json = await request<any>("/api/v1/tasks");
  return (json.data as any[]).map((item) =>
    taskFromJson({ taskId: item.id, taskName: item.name }),
  );
}

// Send a request order to CORE, which will be converted to demand order if CORE accepts it
export async function sendRequestOrder(order: RequestOrder): Promise<void> {
  await request("/api/v1/tasks/demands", {
    method: "POST",
    body: JSON.stringify({
      taskId: order.taskId,
      taskName: order.taskName,
      priority: order.priority,
    }),
  });
}

// Get demand orders from CORE, which are pending tasks waiting for confirmation
export async function getDemandOrders(): Promise<DemandOrder[]> {
  const json = await request<any>("/api/v1/tasks/demands");
  return (json.data as any[]).map(demandOrderFromJson);
}

// Confirm a demand order, which will move it to queue and eventually be executed by robots
export async function confirmDemandOrder(taskId: string): Promise<void> {
  await request("/api/v1/tasks/demands/confirm", {
    method: "POST",
    body: JSON.stringify({ taskId }),
  });
}

// Delete a demand order, which will reject the pending task and remove it from CORE
export async function deleteDemandOrder(taskId: string): Promise<void> {
  await request(`/api/v1/tasks/demands/${taskId}`, { method: "DELETE" });
}

// Get queue orders from CORE, which are confirmed tasks waiting in line for execution
export async function getQueueOrders(): Promise<QueueOrder[]> {
  const json = await request<any>("/api/v1/tasks/registrations");
  return (json.data as any[]).map(queueOrderFromJson);
}

// Get running orders from CORE, which are tasks currently being executed by robots
export async function getRunningOrders(): Promise<RunningOrder[]> {
  const json = await request<any>("/api/v1/tasks/executings");
  return (json.data as any[]).map(runningOrderFromJson);
}

// Cancel a running order, which will send a cancel command to the robot executing the task and move the order to records
export async function cancelRunningOrder(taskId: string): Promise<void> {
  await request("/api/orders/running/cancel", {
    method: "POST",
    body: JSON.stringify({ taskId }),
  });
}

// Get record orders from CORE, which are completed or cancelled tasks
export async function getRecordsOrder(): Promise<RecordOrder[]> {
  const json = await request<any>("/api/v1/tasks/records");
  return (json.data as any[]).map(recordOrderFromJson);
}

// Get record order detail by taskId, which includes the execution result and other info of a completed or cancelled task
export async function getRecordOderDetail(
  taskId: string,
): Promise<RecordOrder> {
  const json = await request<any>(`/api/records/${taskId}`);
  return recordOrderFromJson(json);
}

// Get robots list from CORE, which includes basic info and connection status of all robots
export async function getRobots(): Promise<RobotInfo[]> {
  const json = await request<any>("/api/v1/robots");
  return (json.data as any[]).map(robotInfoFromJson);
}

// Get robot detail by id, which includes real-time status and other info of a specific robot
export async function getRobotDetail(id: string): Promise<RobotStatus> {
  const json = await request<any>(`/api/v1/robots/${id}/status`);
  const rs = json.data.robotStatus;
  const ds = rs.dataStatus ?? {};
  const ts = ds.taskStatus ?? {};
  const ct = ts.currentTask ?? {};
  const clamp = (value: number, max: number) =>
    Math.min(Math.max(0, value), max);

  return {
    id: rs.id ?? "",
    ipAddress: rs.ipAddress ?? "",
    x: Number(json.x ?? 0),
    y: Number(json.y ?? 0),
    theta: Number(json.theta ?? 0),
    mode: clamp(Number(ds.mode ?? 0), 1) as RobotMode,
    voltage: json.voltage != null ? Number(json.voltage) : undefined,
    current: json.current != null ? Number(json.current) : undefined,
    currentTask: ct.taskName ?? "",
    currentTaskId: ct.taskId ?? "",
    taskState: clamp(Number(ct.state ?? 0), 4) as TaskRunningState,
    status: "None",
    online: rs.connected ?? false,
    battery: Number(ds.batLevel ?? 0),
    confidence: ds.confidence != null ? Number(ds.confidence) : undefined,
    chargingMode: clamp(Number(ds.chargingMode ?? 0), 2) as ChargingMode,
    emergency: Boolean(ds.emergency ?? false),
  };
}
