import { z } from "zod";

// User information
// export interface User {
//   account: string;
//   role: string;
//   token: string;
// }

// export function userFromJson(json: Record<string, any>): User {
//   return {
//     account: json.account ?? "",
//     role: json.role ?? "",
//     token: json.token ?? "",
//   };
// }

export const UserSchema = z.object({
  account: z.string().default(""),
  role: z.string().default(""),
  token: z.string().default(""),
});

// This replaces your interface!
export type User = z.infer<typeof UserSchema>;

// This replaces userFromJson!
export function userFromJson(json: unknown): User {
  return UserSchema.parse(json);
}
