"use client";

import mapboxgl from "mapbox-gl";

let workerConfigured = false;

/**
 * Next.js/Turbopack can fail to resolve mapbox-gl's bundled worker chunk, which breaks the map at runtime.
 * Point at Mapbox's hosted CSP worker for the installed GL JS version (same major as npm package).
 */
export function ensureMapboxCspWorker(): void {
  if (typeof window === "undefined" || workerConfigured) return;
  workerConfigured = true;
  const v = mapboxgl.version;
  if (v) {
    mapboxgl.workerUrl = `https://api.mapbox.com/mapbox-gl-js/v${v}/mapbox-gl-csp-worker.js`;
  }
}
