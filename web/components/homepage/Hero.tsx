"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { countUp, pilgrimSpring } from "@/lib/motion";
import type { SummaryStats } from "@/lib/stats.server";

// Hardcoded placeholder list — Agre will send the real batch. Used only in
// the marquee rhythm; real school-level pages surface canonical names.
const PLACEHOLDER_SCHOOLS = [
  "Ocokican Primary",
  "Amuria Boys",
  "Soroti Integrated",
  "Beacon of Hope",
  "St. Mary's Katakwi",
  "Kumi Girls",
  "Moroto Central",
  "Lira Demonstration",
];

type HeroProps = {
  stats: SummaryStats;
};

export function Hero({ stats }: HeroProps) {
  const reduce = useReducedMotion();

  // Staggered entrance — three rows on the left, then the stat card.
  const base: Transition = reduce ? { duration: 0 } : pilgrimSpring;
  const delayed = (i: number): Transition =>
    reduce ? { duration: 0 } : { ...pilgrimSpring, delay: i * 0.15 };

  return (
    <section className="relative isolate overflow-hidden bg-paper">
      {/* Warm paper gradient wash — gives the hero weight without glass. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-paper-soft via-paper to-paper-depth"
      />
      {/* Subtle corner accent, olive tint — warmth, not chrome. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-[520px] rounded-full bg-pilgrim-olive/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-10">
          {/* Left: 7 columns — headline, subhead, CTAs */}
          <div className="md:col-span-7">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(0)}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-pilgrim-olive/10 px-3 py-1 font-condensed text-xs uppercase tracking-wider text-pilgrim-olive ring-1 ring-pilgrim-olive/25"
            >
              <MapPin className="size-3.5" aria-hidden />
              Uganda · Indoor Residual Spraying · Since 2001
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(1)}
              className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl md:text-6xl"
            >
              Protect 100,000 students from malaria, one school at a time.
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(2)}
              className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Pilgrim Africa has been spraying Ugandan schools against malaria
              since 2001. Sponsor one school for a year and join the path to
              100,000 protected students.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(3)}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-lg bg-pilgrim-blue px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-pilgrim-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pilgrim-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Sponsor a school
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 font-medium text-ink transition-colors hover:bg-paper-depth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pilgrim-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                See the map
              </Link>
            </motion.div>
          </div>

          {/* Right: 5 columns — embedded stat card */}
          <motion.aside
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={delayed(4)}
            className="md:col-span-5"
          >
            <HeroStatCard stats={stats} reduce={Boolean(reduce)} base={base} />
          </motion.aside>
        </div>

        {/* Marquee rhythm — school names ticker, Pilgrim register */}
        <div className="relative mt-14 overflow-hidden border-y border-border/60 py-4">
          <p className="mb-3 text-center font-condensed text-[11px] uppercase tracking-widest text-muted-foreground">
            Schools in the program
          </p>
          <SchoolsMarquee schools={PLACEHOLDER_SCHOOLS} reduce={Boolean(reduce)} />
        </div>
      </div>
    </section>
  );
}

export default Hero;

function HeroStatCard({
  stats,
  reduce,
  base,
}: {
  stats: SummaryStats;
  reduce: boolean;
  base: Transition;
}) {
  const safeGoal = Math.max(stats.goal, 1);
  const pct = Math.min(1, stats.studentsCovered / safeGoal);

  const count = useMotionValue(0);
  const displayed = useTransform(count, (v) =>
    Math.round(v).toLocaleString("en-US")
  );

  useEffect(() => {
    if (reduce) {
      count.set(stats.studentsCovered);
      return;
    }
    const controls = animate(count, stats.studentsCovered, {
      duration: countUp.duration,
      ease: countUp.ease,
    });
    return () => controls.stop();
  }, [stats.studentsCovered, reduce, count]);

  const dollarsShort =
    stats.dollarsRaised >= 1000
      ? `$${(stats.dollarsRaised / 1000).toFixed(1)}k`
      : `$${stats.dollarsRaised}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Active-operations badge */}
      <div className="inline-flex items-center gap-2 rounded-full bg-pilgrim-olive/10 px-2.5 py-1 font-condensed text-xs uppercase tracking-wider text-pilgrim-olive ring-1 ring-pilgrim-olive/25">
        <span
          className={`size-2 rounded-full bg-pilgrim-olive ${
            reduce ? "" : "animate-pulse"
          }`}
          aria-hidden
        />
        Currently spraying in Soroti District
      </div>

      {/* Big count */}
      <div className="mt-5">
        <motion.div className="font-display text-4xl font-extrabold leading-none text-ink md:text-5xl">
          {displayed}
        </motion.div>
        <div className="mt-2 font-condensed text-xs uppercase tracking-wider text-muted-foreground">
          of {stats.goal.toLocaleString("en-US")} students protected
        </div>
      </div>

      {/* Progress bar — spring fill, accessible */}
      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-paper-depth ring-1 ring-border"
        role="progressbar"
        aria-label="Students protected toward 100,000 goal"
        aria-valuemin={0}
        aria-valuemax={stats.goal}
        aria-valuenow={stats.studentsCovered}
      >
        <motion.div
          className="h-full rounded-full bg-pilgrim-blue"
          style={{ transformOrigin: "0% 50%" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct }}
          transition={base}
        />
      </div>

      {/* Mini stat row — schools / raised / goal */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
        <MiniStat
          value={stats.schoolsProtected.toLocaleString("en-US")}
          label="Schools"
        />
        <MiniStat value={dollarsShort} label="Raised" />
        <MiniStat value="1,000" label="Goal" />
      </div>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 text-center">
      <div className="font-display text-lg font-bold leading-tight text-ink md:text-xl">
        {value}
      </div>
      <div className="mt-0.5 truncate font-condensed text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SchoolsMarquee({
  schools,
  reduce,
}: {
  schools: string[];
  reduce: boolean;
}) {
  // Duplicate the list once so the translate-by-50% loop is seamless.
  const items = [...schools, ...schools];

  // Reduced motion: render a static grid instead of the scrolling strip.
  if (reduce) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {schools.map((name) => (
          <span
            key={name}
            className="font-condensed text-sm uppercase tracking-wide text-muted-foreground"
          >
            {name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-paper to-transparent"
      />
      <motion.ul
        className="flex w-max gap-10"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ duration: 32, ease: "linear", repeat: Infinity }}
      >
        {items.map((name, i) => (
          <li
            key={`${name}-${i}`}
            className="whitespace-nowrap font-condensed text-sm uppercase tracking-wide text-muted-foreground"
          >
            {name}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
