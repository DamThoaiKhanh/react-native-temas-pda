import { z } from "zod";

// Enums
export enum NotificationType {
  info = "info",
  warning = "warning",
  error = "error",
}

// App Notifications
// export interface AppNotification {
//   id: string;
//   title: string;
//   message: string;
//   type: NotificationType;
//   createdAt: string;
// }

// export function appNotificationFromJson(
//   json: Record<string, any>,
// ): AppNotification {
//   return {
//     id: json.id ?? "",
//     title: json.title ?? "",
//     message: json.message ?? "",
//     type: (Object.values(NotificationType).includes(json.type)
//       ? json.type
//       : NotificationType.info) as NotificationType,
//     createdAt: json.createdAt ?? new Date().toISOString(),
//   };
// }

export const AppNotificationSchema = z.object({
  id: z.string().default(""),
  title: z.string().default(""),
  message: z.string().default(""),
  type: z.nativeEnum(NotificationType).catch(NotificationType.info),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export type AppNotification = z.infer<typeof AppNotificationSchema>;

export function appNotificationFromJson(json: unknown): AppNotification {
  return AppNotificationSchema.parse(json);
}
