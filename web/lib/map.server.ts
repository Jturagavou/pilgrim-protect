/** Created with Cursor — AI-assisted. */

import "server-only";

import type { MapFeature, MapFeatureCollection } from "./types";
import { resolvePublicApiBaseUrl } from "./publicApiBase";

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function normalizeMockCollection(fc: MapFeatureCollection): MapFeatureCollection {
  return {
    type: "FeatureCollection",
    features: fc.features.map((f): MapFeature => {
      const st = f.properties.status;
      const helped = st === "active";
      const h = hashId(f.properties._id);
      const [lng, lat] = f.geometry.coordinates;
      return {
        ...f,
        properties: {
          ...f.properties,
          lastSprayDate: f.properties.lastSprayDate ?? null,
          gapState: helped ? "helped" : "struggling",
          sponsorshipStatus: helped ? "checked-in" : "needs-funding",
          subCounty: "—",
          netsCount: 50 + (h % 250),
          hasMalariaClub: h % 10 < 6,
          lat,
          lng,
        },
      };
    }),
  };
}

export async function getMapData(): Promise<{
  schools: MapFeature[];
  districts: string[];
}> {
  let fc: MapFeatureCollection;

  if (process.env.NEXT_PUBLIC_MOCK === "true") {
    const { mockMapData } = await import("./mockData");
    fc = normalizeMockCollection(mockMapData);
  } else {
    const url = `${resolvePublicApiBaseUrl()}/stats/map`;
    try {
      // Next/undici default connect timeout is ~3s — too tight when the API is cold or Mongo is slow.
      const res = await fetch(url, {
        next: { revalidate: 60, tags: ["map"] },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        throw new Error(`Map data fetch failed: ${res.status}`);
      }
      fc = (await res.json()) as MapFeatureCollection;
    } catch (err) {
      console.warn(
        `[getMapData] ${url} unreachable (${err instanceof Error ? err.message : err}). Using mock GeoJSON so /map still loads.`
      );
      const { mockMapData } = await import("./mockData");
      fc = normalizeMockCollection(mockMapData);
    }
  }

  const schools = fc.features;
  const districtSet = new Set<string>();
  for (const f of schools) {
    districtSet.add(f.properties.district);
  }
  const districts = Array.from(districtSet).sort((a, b) => a.localeCompare(b));

  return { schools, districts };
}
