/** Created with Cursor — AI-assisted. */

import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
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

      <div className="mt-3 rounded-lg border border-border bg-paper-soft px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
          <span>Spray reports</span>
          <span className="font-semibold text-ink">{p.totalSprayReports}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span>Last spray</span>
          <span className="font-semibold text-ink">
            {p.lastSprayDate ? new Date(p.lastSprayDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }) : "Not yet logged"}
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-pilgrim-orange/15 bg-pilgrim-orange/8 px-3 py-2.5 text-xs leading-relaxed text-ink">
        {status === "needs-funding"
          ? "This school is still waiting for dedicated support to move fully into the protection cycle."
          : "This school is already moving through the protection cycle, with visible operational follow-through."}
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

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/schools/${String(p._id)}`}
          className="block w-full text-center text-sm font-medium rounded-lg bg-primary text-primary-foreground py-2 hover:opacity-90 transition-opacity"
        >
          School page
        </Link>
        <Link
          href={`/donate?school=${String(p._id)}`}
          className="block w-full text-center text-sm font-medium rounded-lg border border-pilgrim-orange/20 bg-pilgrim-orange/10 py-2 text-ink hover:bg-pilgrim-orange/15 transition-colors"
        >
          Support this school
        </Link>
      </div>

      <Link
        href={`/donate?school=${String(p._id)}`}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-pilgrim-orange-deep hover:text-pilgrim-orange"
      >
        See support options
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
