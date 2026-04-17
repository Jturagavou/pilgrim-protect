/** Created with Cursor — AI-assisted. */

"use client";

import { useCallback, useEffect, useRef } from "react";

export interface DistrictOption {
  name: string;
  count: number;
}

interface DistrictFilterProps {
  districts: DistrictOption[];
  active: string | null;
  onChange: (district: string | null) => void;
}

export default function DistrictFilter({
  districts,
  active,
  onChange,
}: DistrictFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const chips: Array<{ id: string | null; label: string; count: number }> = [
    { id: null, label: "All", count: districts.reduce((s, d) => s + d.count, 0) },
    ...districts.map((d) => ({
      id: d.name,
      label: d.name,
      count: d.count,
    })),
  ];

  const focusIndex = useCallback(
    (idx: number) => {
      const n = chipRefs.current.length;
      if (n === 0) return;
      const i = ((idx % n) + n) % n;
      chipRefs.current[i]?.focus();
    },
    []
  );

  useEffect(() => {
    chipRefs.current = chipRefs.current.slice(0, chips.length);
  }, [chips.length]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Filter by district"
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin] [mask-image:linear-gradient(90deg,transparent,black_8px,black_calc(100%-8px),transparent)]"
    >
      {chips.map((c, i) => {
        const isActive =
          c.id === null ? active === null : active === c.id;
        return (
          <button
            key={c.id ?? "all"}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            onClick={() => onChange(c.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                focusIndex(i + 1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                focusIndex(i - 1);
              } else if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onChange(c.id);
              }
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-paper-depth"
            }`}
          >
            <span>{c.label}</span>
            <span className="ml-1 opacity-80">· {c.count}</span>
          </button>
        );
      })}
    </div>
  );
}
