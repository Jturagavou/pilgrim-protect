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
    title: "Subsidize",
    body: "Pilgrim Africa offers an initial term of spray and protection service so schools can begin despite tight budgets.",
    Icon: CheckCircle2,
  },
  {
    step: "02",
    title: "Compare",
    body: "Schools share de-identified malaria case information and examine prevention costs against the cost of illness.",
    Icon: FileSignature,
  },
  {
    step: "03",
    title: "Protect",
    body: "Teams implement IRS in classrooms and dormitories using approved insecticides, with education activities around prevention.",
    Icon: SprayCan,
  },
  {
    step: "04",
    title: "Sustain",
    body: "Schools are invited to budget consistently for prevention, contributing to operational costs as they are able.",
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
            Subsidize, compare, protect, sustain.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilgrim Protect starts by lowering the barrier for schools, then
            helps them see the practical case for continued malaria prevention.
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
