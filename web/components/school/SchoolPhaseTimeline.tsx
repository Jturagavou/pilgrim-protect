/** Created with Cursor — AI-assisted. */

import { ChevronRight } from "lucide-react";
import type { SponsorshipStatus } from "@/lib/types";
import { sponsorshipPhaseLabel } from "@/lib/mapLabels";

const ORDER: SponsorshipStatus[] = [
  "needs-funding",
  "funded",
  "contracted",
  "checked-in",
  "data-gathered",
];

interface SchoolPhaseTimelineProps {
  current?: SponsorshipStatus | string;
}

export default function SchoolPhaseTimeline({ current }: SchoolPhaseTimelineProps) {
  const status = (current || "needs-funding") as SponsorshipStatus;
  const idx = Math.max(0, ORDER.indexOf(status));

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h3 className="font-display text-lg text-ink mb-1">Protection journey</h3>
      <p className="text-sm text-muted-foreground mb-4">
        From first gift to field data — where this school stands today.
      </p>
      <div className="flex flex-wrap items-center gap-y-2 gap-x-1 text-sm">
        {ORDER.map((s, i) => {
          const active = i === idx;
          const done = i < idx;
          return (
            <span key={s} className="contents">
              {i > 0 ? (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-border mx-0.5"
                  aria-hidden
                />
              ) : null}
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  active
                    ? "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2"
                    : done
                      ? "bg-paper-depth text-ink border border-border"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {sponsorshipPhaseLabel(s)}
              </span>
            </span>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-ink">
        <span className="font-medium">Current step:</span>{" "}
        <span className="text-primary">{sponsorshipPhaseLabel(status)}</span>
      </p>
    </div>
  );
}
