import { getPublicMapboxToken } from "./mapboxToken";

/** Values for `/api/public/runtime-config` — read from live `process.env` on the Node server (runtime). */
export function getPublicRuntimePayload(): {
  mapboxToken: string;
  apiBaseUrl: string;
} {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";
  return {
    mapboxToken: getPublicMapboxToken(),
    apiBaseUrl,
  };
}
