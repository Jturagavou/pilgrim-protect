"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatAmount(value: string | null) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "$0";
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const amount = searchParams.get("amount");
  const schoolName = searchParams.get("school_name");
  const displayAmount = useMemo(() => formatAmount(amount), [amount]);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#f7f7f5]">
      <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-ink px-6 py-10 text-white sm:px-10 lg:py-14">
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to donation options
          </Link>

          <div className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pilgrim-gold">
              Mock Stripe checkout
            </p>
            <h1 className="mt-4 font-display text-5xl leading-none text-white">
              {displayAmount}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/68">
              Prototype payment handoff for Pilgrim Protect. This page does not
              process a real card.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-white/12 bg-white/8 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-pilgrim-gold" />
              <div>
                <p className="font-semibold text-white">
                  {schoolName || "Where need is greatest"}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/64">
                  Your selected giving context travels into checkout so the donor
                  intent is preserved.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:px-10 lg:py-14">
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LockKeyhole className="h-4 w-4" />
              Secure checkout mock
            </div>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-ink">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">Card information</span>
                <div className="mt-2 overflow-hidden rounded-xl border border-input bg-white">
                  <input
                    placeholder="4242 4242 4242 4242"
                    className="w-full border-b border-input px-3 py-3 text-sm outline-none"
                  />
                  <div className="grid grid-cols-2">
                    <input
                      placeholder="MM / YY"
                      className="border-r border-input px-3 py-3 text-sm outline-none"
                    />
                    <input placeholder="CVC" className="px-3 py-3 text-sm outline-none" />
                  </div>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">Name on card</span>
                <input
                  placeholder="Full name"
                  className="mt-2 w-full rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>

            <Link
              href={`/donate/success?amount=${encodeURIComponent(amount || "")}`}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "mt-8 w-full justify-center rounded-xl py-3"
              )}
            >
              Pay {displayAmount}
            </Link>

            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              Test card numbers are accepted visually only. No payment is charged.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
