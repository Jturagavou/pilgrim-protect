"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect } from "react";
import { countUp, pilgrimSpring } from "@/lib/motion";

type Props = {
  current: number;
  goal: number;
};

export function ProgressTo100k({ current, goal }: Props) {
  const reduce = useReducedMotion();
  const safeGoal = Math.max(goal, 1);
  const pct = Math.min(1, current / safeGoal);

  const count = useMotionValue(0);
  const displayed = useTransform(count, (v) =>
    Math.round(v).toLocaleString("en-US")
  );

  useEffect(() => {
    if (reduce) {
      count.set(current);
      return;
    }
    const controls = animate(count, current, {
      duration: countUp.duration,
      ease: countUp.ease,
    });
    return () => controls.stop();
  }, [current, reduce, count]);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-end justify-between gap-4">
        <motion.span className="font-display text-5xl font-bold leading-none text-ink md:text-6xl">
          {displayed}
        </motion.span>
        <span className="font-condensed text-xs uppercase tracking-wider text-muted-foreground md:text-sm">
          of {goal.toLocaleString("en-US")} students protected
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-paper-depth ring-1 ring-border"
        role="progressbar"
        aria-label="Students protected toward 100,000 goal"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={current}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-pilgrim-orange via-pilgrim-gold to-pilgrim-olive"
          style={{ transformOrigin: "0% 50%" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct }}
          transition={reduce ? { duration: 0 } : pilgrimSpring}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {(pct * 100).toFixed(1)}% of the way to covering every child we plan to
        reach.
      </p>
    </div>
  );
}

export default ProgressTo100k;
