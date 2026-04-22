"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { School, Users, HeartHandshake } from "lucide-react";
import type { ComponentType } from "react";
import { countUp } from "@/lib/motion";

type Formatter = (value: number) => string;

interface StatDef {
  label: string;
  value: number;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  accentClassName: string;
  iconTintClassName: string;
  format: Formatter;
}

type StatTriadProps = {
  schoolsProtected: number;
  studentsCovered: number;
  dollarsRaised: number;
};

const integer: Formatter = (v) => Math.round(v).toLocaleString("en-US");
const usd: Formatter = (v) =>
  `$${Math.round(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function StatTriad({
  schoolsProtected,
  studentsCovered,
  dollarsRaised,
}: StatTriadProps) {
  const stats: StatDef[] = [
    {
      label: "Schools protected",
      value: schoolsProtected,
      Icon: School,
      accentClassName: "bg-pilgrim-gold/15 ring-pilgrim-gold/35",
      iconTintClassName: "text-pilgrim-orange-deep",
      format: integer,
    },
    {
      label: "Students covered",
      value: studentsCovered,
      Icon: Users,
      accentClassName: "bg-pilgrim-olive/10 ring-pilgrim-olive/25",
      iconTintClassName: "text-pilgrim-olive",
      format: integer,
    },
    {
      label: "Raised to date",
      value: dollarsRaised,
      Icon: HeartHandshake,
      accentClassName: "bg-pilgrim-orange/10 ring-pilgrim-orange/25",
      iconTintClassName: "text-pilgrim-orange",
      format: usd,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  accentClassName,
  iconTintClassName,
  format,
}: StatDef) {
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, format);

  useEffect(() => {
    if (reduce) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: countUp.duration,
      ease: countUp.ease,
    });
    return () => controls.stop();
  }, [value, reduce, count]);

  return (
    <div className="flex items-start gap-4 rounded-xl bg-card p-5 ring-1 ring-border">
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-lg ring-1 ${accentClassName}`}
        aria-hidden
      >
        <Icon className={`size-5 ${iconTintClassName}`} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <motion.div className="font-display text-3xl font-bold leading-tight text-foreground">
          {text}
        </motion.div>
        <div className="mt-1 font-condensed text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

export default StatTriad;
