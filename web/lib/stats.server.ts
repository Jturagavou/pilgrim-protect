import "server-only";
import type { components } from "./api-types";

export type SummaryStats = components["schemas"]["SummaryStats"];

const MOCK_STATS: SummaryStats = {
  schoolsProtected: 12,
  studentsCovered: 4_820,
  dollarsRaised: 14_350,
  goal: 100_000,
  progressPct: 4820 / 100_000,
  updatedAt: new Date().toISOString(),
};

// Prefer NEXT_PUBLIC_API_URL (already includes /api/v1), fall back to API_URL,
// then localhost. Mock mode short-circuits the network call.
function resolveBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:8080/api/v1"
  );
}

export async function fetchSummaryStats(): Promise<SummaryStats> {
  if (process.env.NEXT_PUBLIC_MOCK === "true") return MOCK_STATS;

  const base = resolveBaseUrl().replace(/\/+$/, "");
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
