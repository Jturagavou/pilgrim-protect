/** Created with Cursor — AI-assisted. */

interface SchoolMetaBarProps {
  district: string;
  subCounty?: string;
  studentCount: number;
  phaseLabel: string;
}

export default function SchoolMetaBar({
  district,
  subCounty,
  studentCount,
  phaseLabel,
}: SchoolMetaBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-border bg-paper-soft/80 rounded-xl px-4">
      <div className="text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          District
        </p>
        <p className="font-display text-lg text-ink mt-0.5">
          {district}
          {subCounty ? (
            <span className="text-muted-foreground font-sans text-sm font-normal">
              {" "}
              · {subCounty}
            </span>
          ) : null}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Students
        </p>
        <p className="font-display text-lg text-ink mt-0.5 tabular-nums">
          {studentCount.toLocaleString()}
        </p>
      </div>
      <div className="text-center sm:text-right">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Program phase
        </p>
        <p className="font-display text-lg text-primary mt-0.5">{phaseLabel}</p>
      </div>
    </div>
  );
}
