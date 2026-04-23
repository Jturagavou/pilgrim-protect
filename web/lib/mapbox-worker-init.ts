"use client";

import mapboxgl from "mapbox-gl";

let workerConfigured = false;

/**
 * Next.js/Turbopack can fail to resolve mapbox-gl's bundled worker chunk, which breaks the map at runtime.
 * Serve the CSP worker from the app's own origin so browsers accept the worker script.
 */
export function ensureMapboxCspWorker(): void {
  if (typeof window === "undefined" || workerConfigured) return;
  workerConfigured = true;
  mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js";
}
