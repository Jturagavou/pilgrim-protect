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
    body: "IRS treats interior walls in sleeping and learning spaces, killing or repelling mosquitoes for months after the spray has dried.",
    Icon: ShieldCheck,
    tintClassName: "text-pilgrim-orange",
  },
  {
    title: "Why schools",
    body: "In high-transmission areas, a school of 1,000 students can record more malaria cases in a year than it has students. Protecting schools protects learning time.",
    Icon: GraduationCap,
    tintClassName: "text-pilgrim-olive",
  },
  {
    title: "Why Pilgrim",
    body: "Pilgrim Protect pairs spraying with prevention education, school malaria clubs, youth champions, and a cost comparison that helps schools plan beyond one visit.",
    Icon: Landmark,
    tintClassName: "text-pilgrim-orange",
  },
];

export function ContextCards() {
  return (
    <section className="bg-paper-soft py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-condensed text-xs uppercase tracking-[0.22em] text-pilgrim-orange">
            Why this approach
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            A school-centered intervention with a path to sustainability.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilgrim Protect is not just a spray visit. It is a prevention model
            designed around students, schools, and long-term local ownership.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CARDS.map((c) => (
            <article
              key={c.title}
              className="flex flex-col gap-4 rounded-[1.65rem] bg-card p-6 ring-1 ring-border shadow-[0_18px_35px_rgba(45,45,45,0.06)]"
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
