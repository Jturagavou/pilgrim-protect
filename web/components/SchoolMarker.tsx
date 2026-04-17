"use client";

import type { LegacyStatus } from "@/lib/types";

interface SchoolMarkerProps {
  status: LegacyStatus | string;
  name: string;
  onClick?: () => void;
}

// Individual school marker component for custom rendering on map
export default function SchoolMarker({ status, name, onClick }: SchoolMarkerProps) {
  const colors: Record<LegacyStatus, string> = {
    active: "bg-pilgrim-olive ring-pilgrim-olive/30",
    pending: "bg-secondary ring-secondary/30",
    overdue: "bg-destructive ring-destructive/30",
  };

  const colorClass =
    colors[status as LegacyStatus] || "bg-muted-foreground ring-muted-foreground/25";

  return (
    <button
      onClick={onClick}
      className={`w-5 h-5 rounded-full ${colorClass} ring-4 border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform`}
      title={name}
      aria-label={`View ${name}`}
    />
  );
}
