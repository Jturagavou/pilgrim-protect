"use client";

import { formatDate } from "@/lib/formatters";
import type { MockSprayReport } from "@/lib/types";

interface SprayTimelineProps {
  reports?: MockSprayReport[];
}

export default function SprayTimeline({ reports = [] }: SprayTimelineProps) {
  if (!reports.length) {
    return (
      <p className="text-sm text-muted-foreground italic">No spray reports yet.</p>
    );
  }

  // Sort most recent first
  const sorted = [...reports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {sorted.map((report, i) => (
          <div key={report._id || i} className="relative pl-10">
            {/* Dot */}
            <div
              className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-background shadow ${
                report.verified ? "bg-primary" : "bg-amber-500"
              }`}
            />

            <div className="bg-paper-soft rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-primary">
                  {formatDate(report.date)}
                </span>
                {report.verified && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-sm text-ink mt-1">
                <span className="font-semibold">{report.roomsSprayed} rooms</span> sprayed
              </p>

              {report.notes && (
                <p className="text-xs text-muted-foreground mt-1">{report.notes}</p>
              )}

              {report.worker?.name && (
                <p className="text-xs text-muted-foreground mt-2">
                  Worker: {report.worker.name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
