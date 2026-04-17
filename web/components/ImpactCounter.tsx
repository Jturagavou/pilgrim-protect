"use client";

import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { formatNumber } from "@/lib/formatters";

interface ImpactCounterProps {
  end: number;
  label: string;
  duration?: number;
  icon?: ReactNode;
}

export default function ImpactCounter({
  end,
  label,
  duration = 2000,
  icon,
}: ImpactCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          animate();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  function animate() {
    const startTime = performance.now();
    const target = Number(end);

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return (
    <div ref={ref} className="text-center">
      {icon && <div className="text-primary mb-2 flex justify-center">{icon}</div>}
      <div className="text-3xl sm:text-4xl font-bold text-ink">
        {formatNumber(count)}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
