import { ShieldCheck, GraduationCap, Landmark } from "lucide-react";
import type { ComponentType } from "react";

interface ContextCard {
  title: string;
  body: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  tintClassName: string;
}

const CARDS: ContextCard[] = [
  {
    title: "Why indoor residual spraying",
    body: "IRS kills mosquitoes on contact with treated walls. WHO documents up to 90% reductions in malaria where it's applied consistently. Coverage lasts six to twelve months per spray.",
    Icon: ShieldCheck,
    tintClassName: "text-pilgrim-blue",
  },
  {
    title: "Why schools",
    body: "A classroom with a sleeping child at lunchtime is a mosquito's target. Schools concentrate children, have fixed walls to treat, and give us a reliable cadence — term after term.",
    Icon: GraduationCap,
    tintClassName: "text-pilgrim-olive",
  },
  {
    title: "Why Pilgrim",
    body: "Pilgrim Africa is one of the few organizations licensed to import IRS chemicals into Uganda. Every spray is logged by the worker who did it. Every donor sees exactly where the money went.",
    Icon: Landmark,
    tintClassName: "text-pilgrim-orange",
  },
];

export function ContextCards() {
  return (
    <section className="bg-paper-soft py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            A simple intervention, verified in the open.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Three things we are clear on.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CARDS.map((c) => (
            <article
              key={c.title}
              className="flex flex-col gap-4 rounded-2xl bg-card p-6 ring-1 ring-border"
            >
              <c.Icon
                className={`size-7 ${c.tintClassName}`}
                strokeWidth={1.75}
                aria-hidden
              />
              <h3 className="font-display text-xl font-semibold text-ink">
                {c.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContextCards;
