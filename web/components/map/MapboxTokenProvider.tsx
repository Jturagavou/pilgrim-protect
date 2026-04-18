"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { ensureMapboxCspWorker } from "@/lib/mapbox-worker-init";
import { setClientApiBaseUrl } from "@/lib/api";

const MapboxTokenContext = createContext<string>("");

export function MapboxTokenProvider({
  token: serverToken,
  children,
}: {
  token: string;
  children: ReactNode;
}) {
  const [token, setToken] = useState(() => serverToken.trim());

  useLayoutEffect(() => {
    ensureMapboxCspWorker();
  }, []);

  // Production: `next build` may not see DO secrets / bindable URLs — recover live env from Node.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/runtime-config", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { mapboxToken?: string; apiBaseUrl?: string }) => {
        if (cancelled) return;
        const t = data.mapboxToken?.trim() ?? "";
        const api = data.apiBaseUrl?.trim() ?? "";
        if (t) setToken(t);
        if (api) setClientApiBaseUrl(api);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MapboxTokenContext.Provider value={token}>{children}</MapboxTokenContext.Provider>
  );
}

/** Public Mapbox token from the root layout (mirrors NEXT_PUBLIC_MAPBOX_TOKEN at build/runtime). */
export function usePublicMapboxToken(): string {
  return useContext(MapboxTokenContext);
}
