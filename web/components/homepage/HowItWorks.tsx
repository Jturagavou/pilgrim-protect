import { CheckCircle2, FileSignature, SprayCan, ClipboardCheck } from "lucide-react";
import type { ComponentType } from "react";

interface Phase {
  step: string;
  title: string;
  body: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

const PHASES: Phase[] = [
  {
    step: "01",
    title: "Fund",
    body: "A sponsor commits to one school at roughly $1–$2 per student per year. One donation covers one spray cycle.",
    Icon: CheckCircle2,
  },
  {
    step: "02",
    title: "Contract",
    body: "The school signs on. A field worker is assigned and a target date is scheduled for the spray.",
    Icon: FileSignature,
  },
  {
    step: "03",
    title: "Spray",
    body: "A trained worker performs the spray on site, photographing each room and logging room counts via GPS.",
    Icon: SprayCan,
  },
  {
    step: "04",
    title: "Report",
    body: "The report is verified, published to the school's public page, and the sponsor is notified with a direct link.",
    Icon: ClipboardCheck,
  },
];

export function HowItWorks() {
  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl">
          <p className="font-condensed text-xs uppercase tracking-[0.22em] text-pilgrim-orange">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Fund, contract, spray, report.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Four phases. Every school that appears on the map has moved through
            them. Every sponsor can see where theirs is right now.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {PHASES.map((p) => (
            <li
              key={p.step}
              className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-border"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {p.step}
                </span>
                <p.Icon
                  className="size-5 text-pilgrim-orange"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
