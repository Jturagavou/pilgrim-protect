"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Quote } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { stories, type StoryEntry } from "@/lib/stories";

const firstColumn = stories.slice(0, 2);
const secondColumn = [...stories.slice(2, 4), stories[0]];
const thirdColumn = [stories[1], stories[3], stories[2]];

export default function StoriesPage() {
  const reduce = Boolean(useReducedMotion());
  const featured = stories[0];

  return (
    <div className="bg-paper">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,109,35,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.45),transparent)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="rounded-[2rem] border border-border bg-card/75 px-6 py-10 shadow-[0_18px_45px_rgba(45,45,45,0.05)] backdrop-blur-sm sm:px-8">
              <p className="font-condensed text-xs uppercase tracking-[0.24em] text-pilgrim-orange">
                Stories from the field
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                See the field work behind every school we protect.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                These stories trace return visits, hard-to-reach campuses, room-by-room
                documentation, and the practical work required to keep Ugandan schools
                protected over time.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-pilgrim-orange/15 bg-pilgrim-orange/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-pilgrim-orange">
                  {stories.length} documented stories
                </div>
                <div className="rounded-full border border-border bg-paper-soft px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  School-by-school follow-through
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-ink px-6 py-8 text-white shadow-[0_22px_54px_rgba(45,45,45,0.18)]">
              <p className="font-condensed text-xs uppercase tracking-[0.22em] text-pilgrim-gold">
                Featured field note
              </p>
              <h2 className="mt-4 font-display text-3xl leading-[0.98] text-white">
                {featured.title}
              </h2>
              <blockquote className="mt-4 text-lg leading-relaxed text-white/90">
                “{featured.quote}”
              </blockquote>
              <p className="mt-4 text-sm uppercase tracking-[0.16em] text-white/70">
                {featured.worker} · {featured.district} · {featured.dateLabel}
              </p>
              <Link
                href={`/stories/${featured.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-pilgrim-gold underline-offset-4 hover:underline"
              >
                Read the featured story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-sm md:grid-cols-3">
          <StatCard value="Follow-up" label="Return visits and recovery work made visible" />
          <StatCard value="Field-led" label="Worker voice, not donor abstraction" />
          <StatCard value="Trust" label="Evidence, pacing, and operational clarity" />
        </div>

        <div className="rounded-[2rem] border border-border bg-card/65 p-5 shadow-[0_18px_42px_rgba(45,45,45,0.06)] md:p-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-condensed text-xs uppercase tracking-[0.22em] text-pilgrim-orange">
              Story wall
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              A living archive of the work behind the map.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Instead of a flat archive, these stories move like a continuous field
              record so donors can feel the rhythm and continuity of the program.
            </p>
          </div>

          <div className="mt-10 flex justify-center gap-5 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[820px] overflow-hidden">
            <StoryColumn entries={firstColumn} duration={18} reduce={reduce} />
            <StoryColumn
              entries={secondColumn}
              duration={22}
              reduce={reduce}
              className="hidden md:block"
            />
            <StoryColumn
              entries={thirdColumn}
              duration={20}
              reduce={reduce}
              className="hidden lg:block"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StoryColumn({
  entries,
  duration,
  reduce,
  className = "",
}: {
  entries: StoryEntry[];
  duration: number;
  reduce: boolean;
  className?: string;
}) {
  if (reduce) {
    return (
      <div className={className}>
        <div className="flex flex-col gap-5">
          {entries.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-5 pb-5"
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {entries.map((story) => (
              <StoryCard key={`${copy}-${story.slug}`} story={story} ariaHidden={copy === 1} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

function StoryCard({
  story,
  ariaHidden = false,
}: {
  story: StoryEntry;
  ariaHidden?: boolean;
}) {
  return (
    <motion.article
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : 0}
      whileHover={{
        scale: 1.02,
        y: -8,
        boxShadow:
          "0 24px 42px -16px rgba(45,45,45,0.16), 0 8px 18px -10px rgba(45,45,45,0.08)",
        transition: { type: "spring", stiffness: 320, damping: 20 },
      }}
      whileFocus={{
        scale: 1.02,
        y: -8,
        boxShadow:
          "0 24px 42px -16px rgba(45,45,45,0.16), 0 8px 18px -10px rgba(45,45,45,0.08)",
        transition: { type: "spring", stiffness: 320, damping: 20 },
      }}
      className="group max-w-sm rounded-[1.7rem] border border-border bg-card/92 p-6 shadow-[0_12px_26px_rgba(45,45,45,0.06)] outline-none backdrop-blur-sm"
    >
      <div className="flex flex-wrap gap-2">
        {story.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex rounded-full bg-paper-depth px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>

      <h3 className="mt-4 font-display text-2xl font-semibold leading-[1.02] text-ink">
        {story.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {story.excerpt}
      </p>

      <blockquote className="mt-5 rounded-2xl border border-pilgrim-orange/12 bg-pilgrim-orange/8 p-4">
        <div className="flex items-center gap-2 text-pilgrim-orange">
          <Quote className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            Field voice
          </span>
        </div>
        <p className="mt-3 text-sm italic leading-relaxed text-ink">
          &ldquo;{story.quote}&rdquo;
        </p>
      </blockquote>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-pilgrim-orange" />
          <span>{story.district}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-pilgrim-orange" />
          <span>{story.readingTime}</span>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/stories/${story.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-pilgrim-orange-deep underline-offset-4 transition-transform group-hover:translate-x-0.5 hover:underline"
        >
          Read story
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-paper-soft px-4 py-5">
      <div className="font-display text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{label}</div>
    </div>
  );
}
