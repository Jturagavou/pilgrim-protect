/** Created with Cursor — AI-assisted. */

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { pilgrimSpring } from "@/lib/motion";

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

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % TEMPLATES.length), 6500);
    return () => clearInterval(t);
  }, [reduce]);

  const block = TEMPLATES[i];

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
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Photos and quotes from Dorothy&apos;s visits will layer in here when
            Pilgrim shares assets — for now, this page shows live program data for{" "}
            <span className="text-ink font-medium">{schoolName}</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
