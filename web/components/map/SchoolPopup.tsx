/** Created with Cursor — AI-assisted. */

import Link from "next/link";
import { Shield } from "lucide-react";
import {
  phaseBadgeBackground,
  sponsorshipPhaseLabel,
} from "@/lib/mapLabels";
import type { MapFeature } from "@/lib/types";

interface SchoolPopupProps {
  feature: MapFeature;
}

export default function SchoolPopup({ feature }: SchoolPopupProps) {
  const p = feature.properties;
  const status = (p.sponsorshipStatus as string) || "needs-funding";
  const thumb = p.thumbnailUrl;

  return (
    <div className="w-72 rounded-xl border border-border bg-card p-4 shadow-lg">
      <h3 className="font-display text-lg text-ink leading-snug">{p.name}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">
        {p.district}
        {p.subCounty ? ` · ${p.subCounty}` : ""}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        {p.hasMalariaClub ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
            style={{ backgroundColor: "var(--color-state-helped)" }}
          >
            <Shield className="h-3 w-3" aria-hidden />
            Malaria Club
          </span>
        ) : null}
        <span
          className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium text-[color:var(--color-on-phase-badge)]"
          style={{ backgroundColor: phaseBadgeBackground(status) }}
        >
          {sponsorshipPhaseLabel(status)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
        <div>
          <div className="font-semibold text-ink">{p.studentCount}</div>
          students
        </div>
        <div>
          <div className="font-semibold text-ink">{p.netsCount ?? "—"}</div>
          nets
        </div>
        <div className="truncate">
          <div className="font-semibold text-ink tabular-nums">
            {p.lat != null && p.lng != null
              ? `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`
              : "—"}
          </div>
          coords
        </div>
      </div>

      {thumb ? (
        <div className="mt-3 rounded-lg overflow-hidden border border-border aspect-video bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      <Link
        href={`/schools/${String(p._id)}`}
        className="mt-4 block w-full text-center text-sm font-medium rounded-lg bg-primary text-primary-foreground py-2 hover:opacity-90 transition-opacity"
      >
        Learn more
      </Link>
    </div>
  );
}
