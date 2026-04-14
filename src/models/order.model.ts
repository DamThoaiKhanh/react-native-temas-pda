import { z } from "zod";

// Task information
export const TaskSchema = z.object({
  taskId: z.string().default(""),
  taskName: z.string().default(""),
});

export type Task = z.infer<typeof TaskSchema>;

export function taskFromJson(json: unknown): Task {
  return TaskSchema.parse(json);
}

// RequestOrder: Load/Store on device
// export interface RequestOrder {
//   id: string;
//   taskId: string;
//   taskName: string;
//   priority: string;
//   createdAt: string; // ISO string
// }

// export function requestOrderFromJson(json: Record<string, any>): RequestOrder {
//   return {
//     id: json.id ?? "",
//     taskId: json.taskId ?? "",
//     taskName: json.taskName ?? "",
//     priority: json.priority ?? "0",
//     createdAt: json.createdAt ?? new Date().toISOString(),
//   };
// }

export const RequestOrderSchema = z.object({
  id: z.string().default(""),
  taskId: z.string().default(""),
  taskName: z.string().default(""),
  priority: z.string().default("0"),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export type RequestOrder = z.infer<typeof RequestOrderSchema>;

export function requestOrderFromJson(json: unknown): RequestOrder {
  return RequestOrderSchema.parse(json);
}

// DemandOrder: Load/Store from CORE
// export interface DemandOrder {
//   taskId: string;
//   taskName: string;
//   createdAt: string;
// }

// export function demandOrderFromJson(json: Record<string, any>): DemandOrder {
//   return {
//     taskId: json.taskId ?? "",
//     taskName: json.taskName ?? "",
//     createdAt: json.createOn
//       ? new Date(json.createOn).toISOString()
//       : new Date().toISOString(),
//   };
// }

export const DemandOrderSchema = z
  .object({
    taskId: z.string().default(""),
    taskName: z.string().default(""),
    createOn: z.string().optional(),
  })
  .transform((raw) => ({
    taskId: raw.taskId,
    taskName: raw.taskName,
    createdAt: raw.createOn
      ? new Date(raw.createOn).toISOString()
      : new Date().toISOString(),
  }));

export type DemandOrder = z.infer<typeof DemandOrderSchema>;

export function demandOrderFromJson(json: unknown): DemandOrder {
  return DemandOrderSchema.parse(json);
}

// QueueOrder a.k.a TaskRegistration: Load/Store from CORE
// export interface QueueOrder {
//   taskId: string;
//   taskName: string;
//   priority: number;
//   createdAt: string;
// }

// export function queueOrderFromJson(json: Record<string, any>): QueueOrder {
//   return {
//     taskId: json.taskId ?? "",
//     taskName: json.taskName ?? "",
//     priority: Number(json.priority ?? 0),
//     createdAt: json.createOn
//       ? new Date(json.createOn).toISOString()
//       : new Date().toISOString(),
//   };
// }

export const QueueOrderSchema = z
  .object({
    taskId: z.string().default(""),
    taskName: z.string().default(""),
    priority: z.coerce.number().default(0),
    createOn: z.string().optional(),
  })
  .transform((raw) => ({
    taskId: raw.taskId,
    taskName: raw.taskName,
    priority: raw.priority,
    createdAt: raw.createOn
      ? new Date(raw.createOn).toISOString()
      : new Date().toISOString(),
  }));

export type QueueOrder = z.infer<typeof QueueOrderSchema>;

export function queueOrderFromJson(json: unknown): QueueOrder {
  return QueueOrderSchema.parse(json);
}

// RunningOrder a.k.a TaskExecuting: Load/Store from CORE
// export interface RunningOrder {
//   taskId: string;
//   taskName: string;
//   robotIp: string;
//   robotName: string;
//   createdOn: string;
//   startOn: string;
// }

// export function runningOrderFromJson(json: Record<string, any>): RunningOrder {
//   return {
//     taskId: json.taskId ?? "",
//     taskName: json.taskName ?? "",
//     robotIp: json.robotIp ?? "",
//     robotName: json.robotName ?? "",
//     createdOn: json.createdOn
//       ? new Date(json.createdOn).toISOString()
//       : new Date().toISOString(),
//     startOn: json.startOn
//       ? new Date(json.startOn).toISOString()
//       : new Date().toISOString(),
//   };
// }

export const RunningOrderSchema = z
  .object({
    taskId: z.string().default(""),
    taskName: z.string().default(""),
    robotIp: z.string().default(""),
    robotName: z.string().default(""),
    createdOn: z.string().optional(),
    startOn: z.string().optional(),
  })
  .transform((raw) => ({
    taskId: raw.taskId,
    taskName: raw.taskName,
    robotIp: raw.robotIp,
    robotName: raw.robotName,
    createdOn: raw.createdOn
      ? new Date(raw.createdOn).toISOString()
      : new Date().toISOString(),
    startOn: raw.startOn
      ? new Date(raw.startOn).toISOString()
      : new Date().toISOString(),
  }));

export type RunningOrder = z.infer<typeof RunningOrderSchema>;

export function runningOrderFromJson(json: unknown): RunningOrder {
  return RunningOrderSchema.parse(json);
}

// RecordOrder a.k.a TaskRecord: Load/Store from CORE
// export interface RecordOrder {
//   taskId: string;
//   taskName: string;
//   status: string;
//   robotIp?: string;
//   robotName?: string;
//   createdOn?: string;
// }

// export function recordOrderFromJson(json: Record<string, any>): RecordOrder {
//   return {
//     taskId: json.taskId ?? "",
//     taskName: json.taskName ?? "",
//     status: json.status ?? "",
//     robotIp: json.robotIp,
//     robotName: json.robotName,
//     createdOn: json.createdOn
//       ? new Date(json.createdOn).toISOString()
//       : undefined,
//   };
// }

export const RecordOrderSchema = z
  .object({
    taskId: z.string().default(""),
    taskName: z.string().default(""),
    status: z.string().default(""),
    robotIp: z.string().optional(),
    robotName: z.string().optional(),
    createdOn: z.string().optional(),
  })
  .transform((raw) => ({
    taskId: raw.taskId,
    taskName: raw.taskName,
    status: raw.status,
    robotIp: raw.robotIp,
    robotName: raw.robotName,
    createdOn: raw.createdOn
      ? new Date(raw.createdOn).toISOString()
      : undefined,
  }));

export type RecordOrder = z.infer<typeof RecordOrderSchema>;

export function recordOrderFromJson(json: unknown): RecordOrder {
  return RecordOrderSchema.parse(json);
}
