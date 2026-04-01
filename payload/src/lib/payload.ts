import { getPayload as getPayloadInstance } from "payload";
import config from "../../payload.config";

let cachedPayload: Awaited<ReturnType<typeof getPayloadInstance>> | null = null;

export async function getPayload() {
  if (!cachedPayload) {
    cachedPayload = await getPayloadInstance({ config });
  }
  return cachedPayload;
}

export async function getPayloadWithCacheControl() {
  const instance = await getPayload();
  return instance;
}

export function invalidatePayloadCache() {
  cachedPayload = null;
}
