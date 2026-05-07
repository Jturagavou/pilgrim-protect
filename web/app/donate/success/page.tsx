"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

function formatAmount(value: string | null) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "your gift";
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

function DonateSuccessContent() {
  const searchParams = useSearchParams();
  const displayAmount = useMemo(
    () => formatAmount(searchParams.get("amount")),
    [searchParams]
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15">
        <Check className="h-8 w-8 text-secondary" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        Prototype payment complete
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink">Thank you</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        The mock checkout recorded {displayAmount} for Pilgrim Protect. No real
        card was charged, but this shows the donation handoff a donor would see
        after choosing an amount.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/map"
          className="rounded-lg bg-secondary px-6 py-2.5 font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
        >
          See schools on the map
        </Link>
        <Link
          href="/donate"
          className="rounded-lg border border-border px-6 py-2.5 font-medium text-ink transition-colors hover:bg-muted"
        >
          Choose another gift
        </Link>
      </div>
    </div>
  );
}

export default function DonateSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DonateSuccessContent />
    </Suspense>
  );
}
