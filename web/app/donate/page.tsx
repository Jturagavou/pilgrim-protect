/** Created with Cursor — AI-assisted. */

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, HeartHandshake, MapPinned, ShieldCheck } from "lucide-react";
import { fetchSchools } from "@/lib/api";
import type { MockSchool } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_GIVING_URL = "https://pilgrimafrica.org";

type ImpactTier = {
  cents: number;
  amount: string;
  title: string;
  description: string;
  bullets: string[];
};

const IMPACT_TIERS: ImpactTier[] = [
  {
    cents: 2500,
    amount: "$25",
    title: "Helps support field follow-up",
    description:
      "Smaller gifts help sustain the practical work that makes school protection visible and accountable in the field.",
    bullets: [
      "Helps cover field coordination and travel",
      "Supports photo and report documentation",
      "Contributes to keeping school records current",
    ],
  },
  {
    cents: 10000,
    amount: "$100",
    title: "Helps protect more classrooms",
    description:
      "A mid-sized gift can help fund the on-the-ground operations that make indoor residual spraying possible across multiple classrooms.",
    bullets: [
      "Supports spray-day logistics and supplies",
      "Helps teams reach more students in one visit",
      "Contributes to fewer missed school days from malaria",
    ],
  },
  {
    cents: 50000,
    amount: "$500",
    title: "Can help fund a school protection cycle",
    description:
      "Larger gifts can help make a school-focused spray effort possible and connect support to real reporting from the field.",
    bullets: [
      "Supports one school-focused protection effort",
      "Helps protect hundreds of students",
      "Connects giving to school-level updates and evidence",
    ],
  },
];

function givingUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_EXTERNAL_GIVING_URL === "string") {
    return process.env.NEXT_PUBLIC_EXTERNAL_GIVING_URL.replace(/\/+$/, "");
  }
  return DEFAULT_GIVING_URL;
}

function buildGivingHref({
  base,
  amountCents,
  schoolId,
  schoolName,
  source,
}: {
  base: string;
  amountCents?: number;
  schoolId?: string | null;
  schoolName?: string | null;
  source: string;
}) {
  const url = new URL(base);
  if (amountCents) {
    url.searchParams.set("amount", String(amountCents / 100));
  }
  if (schoolId && schoolId !== "general") {
    url.searchParams.set("school", schoolId);
  }
  if (schoolName) {
    url.searchParams.set("school_name", schoolName);
  }
  url.searchParams.set("source", source);
  return url.toString();
}

function DonateContent() {
  const searchParams = useSearchParams();
  const preselectedSchool = searchParams.get("school");

  const [schools, setSchools] = useState<MockSchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>(
    preselectedSchool || "general"
  );

  useEffect(() => {
    fetchSchools().then(setSchools).catch(console.error);
  }, []);

  const base = givingUrl();
  const selected = useMemo(
    () => schools.find((s) => s._id === selectedSchool) ?? null,
    [schools, selectedSchool]
  );

  const schoolName = selectedSchool === "general" ? null : selected?.name ?? null;
  const selectedReadiness =
    selected?.dataQuality?.completeness === "ready"
      ? "Profile ready"
      : selected?.dataQuality?.completeness === "needs-enrichment"
        ? "Profile still being enriched"
        : null;

  const mailBody = [
    "I would like to support Pilgrim Protect / indoor residual spraying for schools in Uganda.",
    schoolName ? `School of interest: ${schoolName}` : "Giving focus: where need is greatest",
    "",
    "(Pilot v1: online card giving opens on Pilgrim Africa’s main site — not yet wired in this demo.)",
  ]
    .filter(Boolean)
    .join("\n");

  const mailto = `mailto:info@pilgrimafrica.org?subject=${encodeURIComponent(
    "Pilgrim Protect — sponsor inquiry"
  )}&body=${encodeURIComponent(mailBody)}`;
  const generalGivingHref = buildGivingHref({
    base,
    schoolId: selectedSchool,
    schoolName,
    source: "pilgrim-protect-donate-general",
  });

  return (
    <div className="bg-paper">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-paper-soft via-paper to-paper-depth">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,109,35,0.15),transparent_32%),radial-gradient(circle_at_left,rgba(127,143,57,0.10),transparent_24%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-18">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-pilgrim-orange">
                <HeartHandshake className="h-3.5 w-3.5 text-pilgrim-orange" />
                Give toward the work
              </div>
              <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[0.95] text-ink">
                What your gift makes possible for students in Uganda
              </h1>
              <p className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
                Pilgrim Protect supports indoor residual spraying, field follow-up,
                and the reporting that helps donors see where support is going.
                This pilot still sends giving through Pilgrim Africa’s main donation
                channels, but the impact focus is already here.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={generalGivingHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "justify-center"
                  )}
                >
                  Give on Pilgrim Africa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a
                  href={mailto}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-center"
                  )}
                >
                  Ask about sponsoring a school
                </a>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-pilgrim-orange/10 p-3">
                  <MapPinned className="h-6 w-6 text-pilgrim-orange" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Direct your support
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Choose a school you care about, or give where need is greatest.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="school"
                  className="block text-sm font-medium text-ink mb-2"
                >
                  School you have in mind
                </label>
                <select
                  id="school"
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full border border-input rounded-xl px-3 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="general">General — where need is greatest</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name} — {school.district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-paper-soft p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-ink">Current selection:</strong>{" "}
                  {schoolName ? (
                    <>
                      {schoolName}
                      {selected?.district ? ` in ${selected.district}` : ""}
                    </>
                  ) : (
                    "where need is greatest across the program"
                  )}
                </p>
                {selected ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="rounded-xl border border-border bg-background px-3 py-2">
                      <div className="font-semibold text-ink">
                        {selected.studentCount || "—"}
                      </div>
                      students
                    </div>
                    <div className="rounded-xl border border-border bg-background px-3 py-2">
                      <div className="font-semibold text-ink">
                        {selected.totalRooms || "—"}
                      </div>
                      rooms
                    </div>
                  </div>
                ) : null}
                {selectedReadiness ? (
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    {selectedReadiness}
                  </p>
                ) : null}
                {selected ? (
                  <div className="mt-3">
                    <Link
                      href={`/schools/${selected._id}`}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      View school profile
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 rounded-2xl border border-pilgrim-orange/20 bg-pilgrim-orange/8 p-4">
                <p className="text-sm leading-relaxed text-ink">
                  <strong>Why not card checkout here yet?</strong> The current
                  pilot focuses on schools, stories, and field reporting while
                  Pilgrim continues to use its established donation infrastructure.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Giving options
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl text-ink tracking-tight">
            What your gift helps make possible
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            These are directional examples for the pilot experience. Exact costs
            vary by school, geography, logistics, and campaign timing.
          </p>
        </div>

        <div className="mt-8 grid gap-4 rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-sm md:grid-cols-3">
          <TrustStat value="Pilgrim Africa" label="Giving still routes through the established donation flow" />
          <TrustStat value="School context" label="Selected school details travel with the outbound link when available" />
          <TrustStat value="Field evidence" label="This platform focuses on visible reporting, not replacing existing checkout" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {IMPACT_TIERS.map((tier) => (
            <article
              key={tier.amount}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Suggested gift
                  </p>
                  <div className="mt-2 font-display text-5xl leading-none text-ink">
                    {tier.amount}
                  </div>
                </div>
                <div className="rounded-2xl bg-pilgrim-orange/10 p-3">
                  <ShieldCheck className="h-6 w-6 text-pilgrim-orange" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                {tier.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {tier.description}
              </p>

              <ul className="mt-6 space-y-3">
                {tier.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm text-ink/90">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-secondary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-border">
                <a
                  href={buildGivingHref({
                    base,
                    amountCents: tier.cents,
                    schoolId: selectedSchool,
                    schoolName,
                    source: `pilgrim-protect-tier-${tier.cents / 100}`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "w-full justify-center"
                  )}
                >
                  Give {tier.amount} now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-border bg-gradient-to-br from-card via-paper-soft to-paper-depth p-6 md:p-8 shadow-[0_18px_45px_rgba(45,45,45,0.06)]">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <div className="inline-flex rounded-full border border-pilgrim-orange/15 bg-pilgrim-orange/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-pilgrim-orange">
                Choose your own impact
              </div>
              <h3 className="mt-4 font-display text-3xl text-ink tracking-tight">
                Give where the field reality is most urgent
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Some schools need urgent scheduling, transport support, follow-up
                visits, or better documentation before the public story is complete.
                Flexible support lets Pilgrim respond where timing, logistics, and
                on-the-ground conditions are most demanding.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <NeedChip title="Travel" body="Reach harder-to-access schools" />
                <NeedChip title="Follow-up" body="Return when visits are incomplete" />
                <NeedChip title="Evidence" body="Fund reporting, photos, and updates" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {[5000, 15000, 30000].map((amount) => (
                  <a
                    key={amount}
                    href={buildGivingHref({
                      base,
                      amountCents: amount,
                      schoolId: selectedSchool,
                      schoolName,
                      source: `pilgrim-protect-flex-${amount / 100}`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-pilgrim-orange/35 hover:bg-paper-soft"
                  >
                    Give ${(amount / 100).toLocaleString("en-US")}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-card p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Your current giving target
              </p>
              <div className="mt-3 font-display text-3xl text-ink leading-tight">
                {schoolName || "Where need is greatest"}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {schoolName
                  ? "Your gift will still route through Pilgrim Africa’s main giving flow, but we’ll carry this school context into the checkout link."
                  : "Use the direct giving link below to support the schools and districts where need is currently greatest."}
              </p>

              <div className="mt-5 rounded-2xl border border-pilgrim-orange/15 bg-pilgrim-orange/8 px-4 py-4 text-sm leading-relaxed text-ink">
                {schoolName
                  ? `Support for ${schoolName} can help connect donor intent to real school-level follow-through, even while the payment itself happens on Pilgrim Africa’s main giving page.`
                  : "Flexible support helps Pilgrim respond to the schools and districts where timing, distance, and operational pressure are greatest."}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={generalGivingHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "w-full justify-center"
                  )}
                >
                  Continue to checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a
                  href={mailto}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-center"
                  )}
                >
                  Ask about custom sponsorship
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-muted-foreground">
            Configure{" "}
            <code className="text-[11px]">NEXT_PUBLIC_EXTERNAL_GIVING_URL</code>{" "}
            to point at the live Pilgrim giving page.
          </p>
          <div className="mt-4">
            <Link
              href="/map"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Explore schools on the map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function NeedChip({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-4">
      <div className="font-semibold text-ink">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</div>
    </div>
  );
}

function TrustStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-paper-soft px-4 py-5">
      <div className="font-display text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{label}</div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DonateContent />
    </Suspense>
  );
}
