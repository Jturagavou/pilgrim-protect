# UI component sign-off — v1 pilot vs COMPONENT-PICKS

Per OM `planning/DESIGN-PHILOSOPHY.md`: **bones, invert the skin**. v1 pilot **does not** require installing 21st.dev blocks via `npx shadcn add <url>`.

## Signed off (hand-built, Pilgrim skin)

| COMPONENT-PICKS ref | Implementation |
|---------------------|----------------|
| §1 glassmorphism-trust-hero (homepage) | [`web/components/homepage/Hero.tsx`](../web/components/homepage/Hero.tsx) — asymmetric hero, progress toward 100k, stat triad, motion; paper/cream register (not zinc glass SaaS). |
| §3 hero-section-2 (school profile) | [`web/components/school/SchoolProfileHero.tsx`](../web/components/school/SchoolProfileHero.tsx) — split layout, clip-path image, CTAs. |
| §5 text-rotate / storytelling | [`web/components/school/SchoolStorySection.tsx`](../web/components/school/SchoolStorySection.tsx) — rotating quotes (plain strings; no raw HTML). |
| §7 pricing-card-1 (sponsor tiers) | **Deferred to v1.5+** — not a pilot gate; homepage uses [`ContextCards`](../web/components/homepage/ContextCards.tsx) / CTA patterns instead. |
| §8 testimonials | **Optional** — [`web/app/stories/page.tsx`](../web/app/stories/page.tsx) may be extended later; not blocking pilot. |

## If you later install a 21st block

Use COMPONENT-PICKS **Skin (swap)** rows literally: replace colors, copy, and imagery; keep structure. Re-run visual QA on mobile widths.
