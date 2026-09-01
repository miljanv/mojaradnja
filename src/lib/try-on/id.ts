import { randomBytes } from "crypto";

export function createId(): string {
  return `c${randomBytes(12).toString("base64url")}`;
}
