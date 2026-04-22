import "server-only";
import type { components } from "./api-types";
import { resolvePublicApiBaseUrl } from "./publicApiBase";

export type SummaryStats = components["schemas"]["SummaryStats"];

const MOCK_STATS: SummaryStats = {
  schoolsProtected: 12,
  studentsCovered: 4_820,
  dollarsRaised: 14_350,
  goal: 100_000,
  progressPct: 4820 / 100_000,
  updatedAt: new Date().toISOString(),
};

export async function fetchSummaryStats(): Promise<SummaryStats> {
  if (process.env.NEXT_PUBLIC_MOCK === "true") return MOCK_STATS;

  const base = resolvePublicApiBaseUrl();
  try {
    const res = await fetch(`${base}/stats`, {
      next: { revalidate: 60, tags: ["stats"] },
    });
    if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
    return (await res.json()) as SummaryStats;
  } catch {
    // Fail safe: never crash the homepage on a stats outage.
    return MOCK_STATS;
  }
}
