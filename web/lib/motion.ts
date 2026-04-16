import type { Transition, Easing } from "motion/react";

// Pilgrim motion presets — restrained, not bouncy. Use these instead of
// hand-tuning spring/duration values so the brand stays coherent across
// the app. Gate any of these on `useReducedMotion()` per the brand theme.

export const pilgrimSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 18,
};

export const gentleFade: Transition = {
  duration: 0.2,
};

export const countUp: Transition = {
  duration: 1.8,
  ease: [0.22, 1, 0.36, 1] as Easing,
};
