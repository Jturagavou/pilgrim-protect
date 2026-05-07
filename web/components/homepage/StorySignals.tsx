"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { stories, type StoryEntry } from "@/lib/stories";
import { pilgrimSpring } from "@/lib/motion";

const firstColumn = stories.slice(0, 2);
const secondColumn = [...stories.slice(2, 4), stories[0]];
const thirdColumn = [stories[1], stories[3], stories[2]];

function StoryColumn({
  entries,
  className = "",
  duration = 18,
  columnId,
  activeStoryId,
  setActiveStoryId,
}: {
  entries: StoryEntry[];
  className?: string;
  duration?: number;
  columnId: string;
  activeStoryId: string | null;
  setActiveStoryId: (id: string | null) => void;
}) {
  const reduce = useReducedMotion();
  const columnHasActiveStory =
    activeStoryId != null && activeStoryId.startsWith(`${columnId}-`);

  if (reduce) {
    return (
      <div className={className}>
        <div className="flex flex-col gap-5">
          {entries.map((story) => (
            <StoryCard
              key={story.slug}
              story={story}
              storyId={`${columnId}-single-${story.slug}`}
              activeStoryId={activeStoryId}
              setActiveStoryId={setActiveStoryId}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`story-marquee flex flex-col gap-5 pb-5 ${
          columnHasActiveStory ? "story-marquee-paused" : ""
        }`}
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {entries.map((story) => (
              <StoryCard
                key={`${copy}-${story.slug}`}
                story={story}
                ariaHidden={copy === 1}
                storyId={`${columnId}-${copy}-${story.slug}`}
                activeStoryId={activeStoryId}
                setActiveStoryId={setActiveStoryId}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function StoryCard({
  story,
  storyId,
  ariaHidden = false,
  activeStoryId,
  setActiveStoryId,
}: {
  story: StoryEntry;
  storyId: string;
  ariaHidden?: boolean;
  activeStoryId: string | null;
  setActiveStoryId: (id: string | null) => void;
}) {
  const isAnotherStoryActive =
    activeStoryId != null && activeStoryId !== storyId;

  return (
    <motion.article
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : 0}
      onHoverStart={() => setActiveStoryId(storyId)}
      onHoverEnd={() => setActiveStoryId(null)}
      onFocus={() => setActiveStoryId(storyId)}
      onBlur={() => setActiveStoryId(null)}
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
      className={`group max-w-sm overflow-hidden rounded-[1.7rem] border border-border bg-card/92 shadow-[0_12px_26px_rgba(45,45,45,0.06)] outline-none backdrop-blur-sm transition-[filter,opacity,transform] duration-300 ${
        isAnotherStoryActive ? "opacity-45 blur-[1.5px]" : "opacity-100 blur-0"
      }`}
    >
      <div className="aspect-[1.55] overflow-hidden bg-paper-depth">
        <img
          src={story.imageUrl}
          alt={story.imageAlt}
          style={{ objectPosition: story.imagePosition }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>

      <div className="p-6">
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
          <p className="text-sm italic leading-relaxed text-ink">
            &ldquo;{story.quote}&rdquo;
          </p>
          <footer className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {story.worker} · {story.district}
          </footer>
        </blockquote>

        <div className="mt-5 flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">{story.readingTime}</span>
          <Link
            href={`/stories/${story.slug}`}
            className="font-semibold text-pilgrim-orange-deep underline-offset-4 hover:underline"
          >
            Read story
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function StorySignals() {
  const reduce = useReducedMotion();
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-paper py-18 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,109,35,0.10),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.2),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={reduce ? { duration: 0 } : { ...pilgrimSpring, delay: 0.06 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-condensed text-xs uppercase tracking-[0.22em] text-pilgrim-orange">
            Program narrative
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Let official program stories explain what Pilgrim Protect does.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            These stories are grounded in Pilgrim Africa’s public Pilgrim Protect
            materials: student testimony, IRS, prevention education, malaria clubs,
            school cost comparisons, and sustainable follow-up.
          </p>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <div className="rounded-2xl border border-pilgrim-orange/15 bg-pilgrim-orange/8 px-5 py-4 text-center text-sm leading-relaxed text-ink max-w-2xl">
            Donors are more likely to act when they understand both the student
            impact and the practical school model behind the work.
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-pilgrim-orange/30 hover:bg-paper-soft"
          >
            Browse program stories
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-12 flex justify-center gap-5 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[760px] overflow-hidden">
          <StoryColumn
            entries={firstColumn}
            duration={18}
            columnId="home-a"
            activeStoryId={activeStoryId}
            setActiveStoryId={setActiveStoryId}
          />
          <StoryColumn
            entries={secondColumn}
            duration={22}
            className="hidden md:block"
            columnId="home-b"
            activeStoryId={activeStoryId}
            setActiveStoryId={setActiveStoryId}
          />
          <StoryColumn
            entries={thirdColumn}
            duration={20}
            className="hidden lg:block"
            columnId="home-c"
            activeStoryId={activeStoryId}
            setActiveStoryId={setActiveStoryId}
          />
        </div>
      </div>
    </section>
  );
}
