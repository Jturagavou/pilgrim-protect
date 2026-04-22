/** Created with Cursor — AI-assisted. */

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { pilgrimSpring } from "@/lib/motion";
import Link from "next/link";
import { getStoriesByDistrict } from "@/lib/stories";

interface SchoolStorySectionProps {
  schoolName: string;
  district: string;
}

const TEMPLATES: Array<{ quote: string; attribution: string }> = [
  {
    quote:
      "When the spray team came, parents finally saw that someone was standing with their children.",
    attribution: "Field partner",
  },
  {
    quote:
      "Every classroom protected means fewer fevers, fewer missed lessons, more children finishing the term.",
    attribution: "Program goal",
  },
  {
    quote:
      "This school is part of Pilgrim's path to 100,000 students protected — one gift at a time.",
    attribution: "Pilgrim Protect",
  },
];

export default function SchoolStorySection({
  schoolName,
  district,
}: SchoolStorySectionProps) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const districtStories = getStoriesByDistrict(district);
  const storyPool =
    districtStories.length > 0
      ? districtStories.map((story) => ({
          quote: story.quote,
          attribution: `${story.worker} · ${story.dateLabel}`,
          slug: story.slug,
          title: story.title,
          schoolFocus: story.schoolFocus,
        }))
      : TEMPLATES.map((item) => ({
          ...item,
          slug: null,
          title: null,
          schoolFocus: null,
        }));

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % storyPool.length), 6500);
    return () => clearInterval(t);
  }, [reduce, storyPool.length]);

  const block = storyPool[i];

  return (
    <section
      id="story"
      className="scroll-mt-24 py-12 border-t border-border"
    >
      <div className="grid md:grid-cols-5 gap-8 items-center">
        <div className="md:col-span-2 order-2 md:order-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Why it matters
          </p>
          <h2 className="font-display text-2xl text-ink leading-snug">
            {schoolName}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{district} District</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {districtStories.length > 0
              ? `This district already has ${districtStories.length} field stor${districtStories.length === 1 ? "y" : "ies"} connected to the public narrative.`
              : "Public field stories for this district are still being layered in as the reporting archive grows."}
          </p>
          <div className="mt-4 rounded-xl border border-pilgrim-orange/15 bg-pilgrim-orange/8 p-4">
            <p className="text-sm leading-relaxed text-ink">
              This is where support becomes more credible: the story is tied to a
              real district, a real school context, and a documented operational trail.
            </p>
          </div>
          <div className="mt-6 min-h-[7rem]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={block.quote}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={reduce ? { duration: 0 } : pilgrimSpring}
                className="text-base text-ink leading-relaxed border-l-4 border-primary pl-4"
              >
                {block.quote}
                <footer className="mt-3 text-sm text-muted-foreground not-italic">
                  — {block.attribution}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          {block.slug ? (
            <Link
              href={`/stories/${block.slug}`}
              className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Read related field story
            </Link>
          ) : null}
        </div>
        <div className="md:col-span-3 order-1 md:order-2 rounded-2xl border border-border bg-paper-alt p-6 shadow-sm">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Indoor residual spraying reaches the walls where malaria-carrying
            mosquitoes rest. Pilgrim coordinates teams, supplies, and follow-up so
            communities aren&apos;t left guessing — and donors can see the arc from{" "}
            <strong className="text-ink font-medium">funded</strong> to{" "}
            <strong className="text-ink font-medium">data gathered</strong> in
            the field.
          </p>
          {block.schoolFocus ? (
            <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Current public narrative focus
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/90">
                {block.schoolFocus}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Photos and school-specific reporting will deepen this page over
              time. For now, it combines live operational data with the nearest
              district-level field narrative for{" "}
              <span className="text-ink font-medium">{schoolName}</span>.
            </p>
          )}
          <div className="mt-5">
            <Link
              href={`/donate`}
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_26px_rgba(255,109,35,0.22)] transition-colors hover:bg-pilgrim-orange-deep"
            >
              Help move this work forward
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
