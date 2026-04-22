import { getPublicMapboxToken } from "./mapboxToken";
import { normalizePublicApiBaseUrl } from "./publicApiBase";

/** Values for `/api/public/runtime-config` — read from live `process.env` on the Node server (runtime). */
export function getPublicRuntimePayload(): {
  mapboxToken: string;
  apiBaseUrl: string;
} {
  return {
    mapboxToken: getPublicMapboxToken(),
    apiBaseUrl: normalizePublicApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  };
}
