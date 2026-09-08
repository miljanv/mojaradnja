import { randomBytes } from "crypto";

export function createId(): string {
  return `c${randomBytes(12).toString("base64url")}`;
}

/** Unguessable token used in public KakoMiStoji share URLs. */
export function createShareToken(): string {
  return randomBytes(16).toString("base64url");
}
