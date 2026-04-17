"use client";

import Link from "next/link";

export default function DonateSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="font-display text-3xl text-ink">Thank you</h1>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        The v1 pilot does not process donations on this site. If you gave
        through Pilgrim Africa’s main channels or reached out by email, your
        support helps fund indoor residual spraying so students can learn
        without the threat of malaria.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href="/map"
          className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          See schools on the map
        </Link>
        <Link
          href="/donate"
          className="px-6 py-2.5 border border-border text-ink font-medium rounded-lg hover:bg-muted transition-colors"
        >
          Give or contact Pilgrim
        </Link>
      </div>
    </div>
  );
}
