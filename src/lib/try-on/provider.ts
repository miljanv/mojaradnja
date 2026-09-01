import type { TryOnProvider } from "./types";
import { FalFashnTryOnProvider } from "./fal-provider";

let cached: TryOnProvider | null = null;

export function getTryOnProvider(): TryOnProvider {
  if (cached) return cached;
  const name = process.env.TRY_ON_PROVIDER ?? "fal-fashn-v1.6";
  if (name === "fal-fashn-v1.6") {
    cached = new FalFashnTryOnProvider();
    return cached;
  }
  throw new Error(`Unknown TRY_ON_PROVIDER: ${name}`);
}
