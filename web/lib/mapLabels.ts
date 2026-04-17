/** Created with Cursor — AI-assisted. */

import type { MapFeatureProperties, SponsorshipStatus } from "./types";

export function pinFill(p: MapFeatureProperties): string {
  if (p.gapState === "struggling") return "var(--color-state-struggling)";
  if (p.gapState === "helped") return "var(--color-state-helped)";
  return "var(--color-state-neutral)";
}

const PHASE_LABEL: Record<SponsorshipStatus, string> = {
  "needs-funding": "Needs funding",
  funded: "Funded",
  contracted: "Contracted",
  "checked-in": "Checked in",
  "data-gathered": "Data gathered",
};

export function sponsorshipPhaseLabel(status: string): string {
  return PHASE_LABEL[status as SponsorshipStatus] ?? status;
}

export function phaseBadgeBackground(status: string): string {
  switch (status) {
    case "funded":
      return "var(--color-phase-funded)";
    case "contracted":
      return "var(--color-phase-contracted)";
    case "checked-in":
      return "var(--color-phase-checked-in)";
    case "data-gathered":
      return "var(--color-phase-data-gathered)";
    case "needs-funding":
      return "var(--color-state-struggling)";
    default:
      return "var(--color-state-neutral)";
  }
}
