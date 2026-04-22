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
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  Play,
  ShieldCheck,
  Sprout,
  Target,
} from "lucide-react";
import { countUp, pilgrimSpring } from "@/lib/motion";
import type { SummaryStats } from "@/lib/stats.server";

const PROGRAM_SIGNALS = [
  "Real schools",
  "Field reports",
  "Photo evidence",
  "GPS-tagged visits",
  "Uganda districts",
  "Donor-visible progress",
];

const FIELD_VOICES = [
  {
    quote:
      "No school should fall through the cracks. Every child deserves protection, no matter how remote.",
    attribution: "Field worker · Tororo",
  },
  {
    quote:
      "When the teams return with photos and room counts, communities know this is real follow-through.",
    attribution: "Program operations",
  },
  {
    quote:
      "A school is not just a pin on a map. It is a place where attendance, health, and trust are all connected.",
    attribution: "Pilgrim Protect",
  },
];

type HeroProps = {
  stats: SummaryStats;
};

export function Hero({ stats }: HeroProps) {
  const reduce = useReducedMotion();

  const base: Transition = reduce ? { duration: 0 } : pilgrimSpring;
  const delayed = (i: number): Transition =>
    reduce ? { duration: 0 } : { ...pilgrimSpring, delay: i * 0.14 };

  return (
    <section className="relative isolate overflow-hidden bg-paper text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,109,35,0.14),transparent_28%),radial-gradient(circle_at_left,rgba(127,143,57,0.10),transparent_22%),linear-gradient(135deg,var(--color-paper-soft),var(--color-paper),var(--color-paper-depth))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 size-[480px] rounded-full bg-pilgrim-orange/12 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-18 md:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-7 pt-4">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(0)}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pilgrim-orange flex items-center gap-2">
                  <MapPin className="size-3.5 text-pilgrim-orange" aria-hidden />
                  Uganda · Indoor Residual Spraying · Since 2001
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(1)}
              className="max-w-4xl font-display text-5xl font-bold tracking-tight leading-[0.9] sm:text-6xl lg:text-7xl"
            >
              Protect students from malaria with
              <span className="block bg-gradient-to-br from-pilgrim-orange via-pilgrim-orange-deep to-pilgrim-gold bg-clip-text text-transparent">
                visible, school-level follow-through.
              </span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(2)}
              className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Pilgrim Protect links real schools, field reporting, and donor-facing
              visibility. The goal is not just to fund a visit, but to show where
              protection is happening and what support makes possible over time.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(3)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/donate"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_rgba(255,109,35,0.28)] transition-transform hover:scale-[1.01] hover:bg-pilgrim-orange-deep active:scale-[0.99]"
              >
                See what your gift makes possible
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/map"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/70 px-7 py-4 text-sm font-semibold text-ink backdrop-blur-sm transition-colors hover:border-pilgrim-orange/40 hover:bg-card"
              >
                <Play className="size-4 fill-current" />
                Explore the live map
              </Link>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={delayed(4)}
              className="grid gap-3 sm:grid-cols-3"
            >
              <SignalPill
                icon={<ShieldCheck className="h-4 w-4 text-pilgrim-orange" />}
                title="Verified in the field"
                body="Reports, photos, and school-level updates"
              />
              <SignalPill
                icon={<HeartHandshake className="h-4 w-4 text-pilgrim-orange" />}
                title="Donor-visible impact"
                body="A clearer line from support to follow-through"
              />
              <SignalPill
                icon={<Sprout className="h-4 w-4 text-pilgrim-olive" />}
                title="Built to grow"
                body="Start with Uganda, expand as the program expands"
              />
            </motion.div>
          </div>

          <motion.aside
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={delayed(5)}
            className="lg:col-span-5 lg:pt-8 space-y-5"
          >
            <HeroProgramCard stats={stats} reduce={Boolean(reduce)} base={base} />
            <FieldVoicesCard reduce={Boolean(reduce)} base={base} />
          </motion.aside>
        </div>

        <div className="relative mt-14 overflow-hidden rounded-2xl border border-border bg-card/70 px-5 py-4 backdrop-blur-sm">
          <p className="mb-3 text-center font-condensed text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Program signals
          </p>
          <SignalsMarquee items={PROGRAM_SIGNALS} reduce={Boolean(reduce)} />
        </div>
      </div>
    </section>
  );
}

export default Hero;

function HeroProgramCard({
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
  const pctLabel = `${Math.round(pct * 100)}%`;

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
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-[0_20px_50px_rgba(45,45,45,0.08)]">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-pilgrim-orange/12 blur-3xl"
      />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-pilgrim-orange/10 px-3 py-1.5 font-condensed text-xs uppercase tracking-[0.18em] text-pilgrim-orange ring-1 ring-pilgrim-orange/20">
          <span
            className={`size-2 rounded-full bg-pilgrim-orange ${
              reduce ? "" : "animate-pulse"
            }`}
            aria-hidden
          />
          Program in motion
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Students protected</p>
            <motion.div className="mt-2 font-display text-5xl font-medium leading-none text-ink">
              {displayed}
            </motion.div>
          </div>
          <div className="rounded-2xl bg-pilgrim-orange/10 p-3 ring-1 ring-pilgrim-orange/15">
            <Target className="h-6 w-6 text-pilgrim-orange" aria-hidden />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coverage visibility</span>
            <span className="font-semibold text-ink">{pctLabel}</span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-paper-depth ring-1 ring-border"
            role="progressbar"
            aria-label="Students protected toward 100,000 goal"
            aria-valuemin={0}
            aria-valuemax={stats.goal}
            aria-valuenow={stats.studentsCovered}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pilgrim-orange to-pilgrim-gold"
              style={{ transformOrigin: "0% 50%" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: pct }}
              transition={base}
            />
          </div>
        </div>

        <div className="mt-2 text-xs font-condensed uppercase tracking-[0.18em] text-muted-foreground">
          of {stats.goal.toLocaleString("en-US")} students in the current target
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3 border-t border-border pt-5">
          <MiniStat
            value={stats.schoolsProtected.toLocaleString("en-US")}
            label="Schools"
          />
          <div className="h-8 w-px bg-border" aria-hidden />
          <MiniStat value={dollarsShort} label="Raised" />
          <div className="h-8 w-px bg-border" aria-hidden />
          <MiniStat value="100k" label="Target" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-pilgrim-orange/15 bg-pilgrim-orange/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-pilgrim-orange">
            <span
              className={`size-2 rounded-full bg-pilgrim-orange ${
                reduce ? "" : "animate-pulse"
              }`}
              aria-hidden
            />
            Field active
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pilgrim-olive/20 bg-pilgrim-olive/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-pilgrim-olive">
            Donor ready
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldVoicesCard({
  reduce,
  base,
}: {
  reduce: boolean;
  base: Transition;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_18px_40px_rgba(45,45,45,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pilgrim-orange">
            Voices from the field
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink">
            Why this work matters
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {FIELD_VOICES.map((item, index) => (
          <motion.blockquote
            key={item.quote}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce ? { duration: 0 } : { ...base, delay: index * 0.1 }
            }
            className="rounded-2xl border border-border bg-paper-soft p-4"
          >
            <p className="text-sm leading-relaxed text-ink">“{item.quote}”</p>
            <footer className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {item.attribution}
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </div>
  );
}

function SignalPill({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 text-center">
      <div className="font-display text-lg font-semibold leading-tight text-ink md:text-xl">
        {value}
      </div>
      <div className="mt-0.5 truncate font-condensed text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SignalsMarquee({
  items,
  reduce,
}: {
  items: string[];
  reduce: boolean;
}) {
  const duped = [...items, ...items];

  if (reduce) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {items.map((item) => (
          <span
            key={item}
            className="font-condensed text-sm uppercase tracking-[0.18em] text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-card to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card to-transparent"
      />
      <motion.ul
        className="flex w-max gap-10"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {duped.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="whitespace-nowrap font-condensed text-sm uppercase tracking-[0.18em] text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
