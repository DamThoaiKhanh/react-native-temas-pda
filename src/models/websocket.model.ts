import { z } from "zod";

// WebSocket Events and Meta data
// export interface WsMeta {
//   code: number;
//   createAt?: string;
//   msg?: string;
// }

export const WsMetaSchema = z.object({
  code: z.coerce.number().default(-1),
  createAt: z.string().optional(),
  msg: z.string().optional(),
});

export type WsMeta = z.infer<typeof WsMetaSchema>;

// WsEvent
// export interface WsEvent {
//   command: number;
//   data?: Record<string, any>;
//   meta?: WsMeta;
// }

// export function wsEventFromJson(json: Record<string, any>): WsEvent {
//   return {
//     command: json.command ?? -1,
//     data:
//       typeof json.data === "object" && !Array.isArray(json.data)
//         ? json.data
//         : undefined,
//     meta:
//       typeof json.meta === "object"
//         ? {
//             code: json.meta.code ?? -1,
//             createAt: json.meta.createAt,
//             msg: json.meta.msg,
//           }
//         : undefined,
//   };
// }

// export function wsEventIsOk(event: WsEvent): boolean {
//   return event.meta?.code === 0;
// }

export const WsEventSchema = z.object({
  command: z.coerce.number().default(-1),
  data: z.record(z.string(), z.any()).optional(),
  meta: WsMetaSchema.optional(),
});

export type WsEvent = z.infer<typeof WsEventSchema>;

export function wsEventFromJson(json: unknown): WsEvent {
  return WsEventSchema.parse(json);
}

export function wsEventIsOk(event: WsEvent): boolean {
  return event.meta?.code === 0;
}
