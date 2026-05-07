/** Created with Cursor — AI-assisted. */

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import { fetchSchools } from "@/lib/api";
import type { MockSchool } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImpactTier = {
  cents: number;
  label: string;
  title: string;
  description: string;
  note: string;
};

const IMPACT_TIERS: ImpactTier[] = [
  {
    cents: 2500,
    label: "$25",
    title: "Field follow-up",
    description:
      "Helps keep practical coordination, travel, and school records moving.",
    note: "Good for steady support",
  },
  {
    cents: 10000,
    label: "$100",
    title: "Classroom protection",
    description:
      "Supports the spray-day logistics and supplies that help teams reach more students.",
    note: "Popular starting point",
  },
  {
    cents: 50000,
    label: "$500",
    title: "School protection cycle",
    description:
      "Can help fund a larger school-focused protection push with visible follow-through.",
    note: "High-impact gift",
  },
];

function checkoutHref({
  amountCents,
  schoolId,
  schoolName,
  source,
}: {
  amountCents: number;
  schoolId: string;
  schoolName?: string | null;
  source: string;
}) {
  const params = new URLSearchParams({
    amount: String(amountCents / 100),
    school: schoolId,
    source,
  });
  if (schoolName) params.set("school_name", schoolName);
  return `/donate/checkout?${params.toString()}`;
}

function DonateContent() {
  const searchParams = useSearchParams();
  const preselectedSchool = searchParams.get("school");

  const [schools, setSchools] = useState<MockSchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>(
    preselectedSchool || "general"
  );
  const [customAmount, setCustomAmount] = useState("1000");

  useEffect(() => {
    fetchSchools().then(setSchools).catch(console.error);
  }, []);

  const selected = useMemo(
    () => schools.find((school) => school._id === selectedSchool) ?? null,
    [schools, selectedSchool]
  );

  const schoolName = selectedSchool === "general" ? null : selected?.name ?? null;
  const customCents = Math.max(100, Math.round(Number(customAmount || 0) * 100));

  return (
    <div className="bg-paper">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-paper-soft via-paper to-paper-depth">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,109,35,0.15),transparent_32%),radial-gradient(circle_at_left,rgba(127,143,57,0.10),transparent_24%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-pilgrim-orange">
                <HeartHandshake className="h-3.5 w-3.5" />
                Give toward Pilgrim Protect
              </div>
              <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[0.94] tracking-tight text-ink sm:text-5xl md:text-6xl">
                Choose a gift, then continue through a secure checkout.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Gifts support school-based malaria prevention: indoor residual
                spraying, prevention education, school malaria clubs, and the
                follow-up that helps schools plan beyond one visit.
              </p>
            </div>

            <aside className="rounded-[1.75rem] border border-border bg-card/92 p-5 shadow-[0_18px_42px_rgba(45,45,45,0.07)]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-pilgrim-orange/10 p-3">
                  <MapPinned className="h-5 w-5 text-pilgrim-orange" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">Giving target</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Keep it general, or carry a school name into checkout.
                  </p>
                </div>
              </div>

              <label htmlFor="school" className="mt-5 block text-sm font-medium text-ink">
                School you have in mind
              </label>
              <select
                id="school"
                value={selectedSchool}
                onChange={(event) => setSelectedSchool(event.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="general">General — where need is greatest</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.name} — {school.district}
                  </option>
                ))}
              </select>

              <div className="mt-4 rounded-2xl border border-border bg-paper-soft p-4 text-sm leading-relaxed text-muted-foreground">
                <strong className="text-ink">
                  {schoolName || "Where need is greatest"}
                </strong>
                {selected ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
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
                ) : (
                  <span className="block mt-1">
                    Flexible support helps Pilgrim respond to urgent timing,
                    distance, and operational pressure.
                  </span>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Giving options
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-ink md:text-4xl">
              Start with a suggested gift, or set your own.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            This is a mock checkout in the donor prototype. It models the payment
            handoff without processing real cards.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {IMPACT_TIERS.map((tier) => (
            <DonationCard
              key={tier.cents}
              tier={tier}
              href={checkoutHref({
                amountCents: tier.cents,
                schoolId: selectedSchool,
                schoolName,
                source: `pilgrim-protect-tier-${tier.cents / 100}`,
              })}
            />
          ))}

          <article className="relative flex min-h-[390px] flex-col overflow-hidden rounded-[1.75rem] border border-pilgrim-orange/25 bg-ink p-6 text-white shadow-[0_22px_54px_rgba(45,45,45,0.18)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pilgrim-orange to-pilgrim-gold" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pilgrim-gold">
                  Custom
                </p>
                <h3 className="mt-3 font-display text-3xl leading-[0.98] text-white">
                  Choose your own amount
                </h3>
              </div>
              <BadgeDollarSign className="h-7 w-7 text-pilgrim-gold" />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/72">
              Best for larger gifts, school sponsorship conversations, or
              flexible support where Pilgrim can respond to urgent field needs.
            </p>

            <label htmlFor="custom-amount" className="mt-6 text-sm font-medium text-white">
              Amount
            </label>
            <div className="mt-2 flex items-center rounded-2xl border border-white/14 bg-white/10 px-4 py-3">
              <span className="text-xl font-semibold text-white/72">$</span>
              <input
                id="custom-amount"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                inputMode="decimal"
                className="ml-2 w-full bg-transparent font-display text-4xl leading-none text-white outline-none placeholder:text-white/35"
                placeholder="1000"
              />
            </div>

            <div className="mt-auto pt-7">
              <Link
                href={checkoutHref({
                  amountCents: customCents,
                  schoolId: selectedSchool,
                  schoolName,
                  source: "pilgrim-protect-custom",
                })}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full justify-center bg-pilgrim-orange text-white hover:bg-pilgrim-orange-deep"
                )}
              >
                Continue with custom gift
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>

        <div className="mt-10 grid gap-4 rounded-[1.75rem] border border-border bg-card/72 p-5 shadow-sm md:grid-cols-3">
          <TrustStat
            value="IRS"
            label="Supports mosquito control in classrooms and dormitories"
          />
          <TrustStat
            value="Education"
            label="Helps prevention materials, malaria clubs, and youth champions"
          />
          <TrustStat
            value="Sustain"
            label="Supports follow-up that helps schools plan for prevention"
          />
        </div>
      </section>
    </div>
  );
}

function DonationCard({ tier, href }: { tier: ImpactTier; href: string }) {
  return (
    <article className="group flex min-h-[390px] flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(45,45,45,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Suggested gift
          </p>
          <div className="mt-3 font-display text-5xl leading-none text-ink">
            {tier.label}
          </div>
        </div>
        <div className="rounded-2xl bg-pilgrim-orange/10 p-3">
          <ShieldCheck className="h-6 w-6 text-pilgrim-orange" />
        </div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-ink">{tier.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {tier.description}
      </p>
      <div className="mt-5 rounded-2xl border border-border bg-paper-soft px-4 py-3 text-sm font-medium text-ink">
        {tier.note}
      </div>
      <div className="mt-auto pt-7">
        <Link
          href={href}
          className={cn(buttonVariants({ variant: "secondary" }), "w-full justify-center")}
        >
          Give {tier.label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </article>
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DonateContent />
    </Suspense>
  );
}
