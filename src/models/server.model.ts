import { z } from "zod";

// Server Configuration
// export interface ServerConfig {
//   ipAddress: string;
//   port: string;
// }

// export function serverConfigFromJson(json: Record<string, any>): ServerConfig {
//   return {
//     ipAddress: json.ipAddress ?? "",
//     port: json.port ?? "8088",
//   };
// }

// export function getBaseUrl(config: ServerConfig): string {
//   return `http://${config.ipAddress}:${config.port}`;
// }

const ServerconfigSchema = z.object({
  ipAddress: z.string().default(""),
  port: z.string().default("8088"),
});

export type ServerConfig = z.infer<typeof ServerconfigSchema>;

export function serverConfigFromJson(json: unknown): ServerConfig {
  return ServerconfigSchema.parse(json);
}

export function getBaseUrl(config: ServerConfig): string {
  return `http://${config.ipAddress}:${config.port}`;
}
