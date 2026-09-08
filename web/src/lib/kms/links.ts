import { headers } from "next/headers";
import { KMS_PATH_PREFIX, isKmsHost } from "./config";

/**
 * On the KakoMiStoji host the middleware rewrites `/x` to `/kms/x`, so links
 * must stay unprefixed. Anywhere else (localhost, mojshop.app) the same pages
 * are reachable only under `/kms`.
 */
export async function getKmsPrefix(): Promise<string> {
  const h = await headers();
  return isKmsHost(h.get("host")) ? "" : KMS_PATH_PREFIX;
}
