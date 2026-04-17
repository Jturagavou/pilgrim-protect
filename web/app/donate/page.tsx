/** Created with Cursor — AI-assisted. */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchSchools } from "@/lib/api";
import type { MockSchool } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_GIVING_URL = "https://pilgrimafrica.org";

function givingUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_EXTERNAL_GIVING_URL === "string") {
    return process.env.NEXT_PUBLIC_EXTERNAL_GIVING_URL.replace(/\/+$/, "");
  }
  return DEFAULT_GIVING_URL;
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
  const schoolName =
    selectedSchool === "general"
      ? null
      : schools.find((s) => s._id === selectedSchool)?.name ?? null;

  const mailBody = [
    "I would like to support Pilgrim Protect / indoor residual spraying for schools in Uganda.",
    schoolName ? `School of interest: ${schoolName}` : "",
    "",
    "(Pilot v1: online card giving opens on Pilgrim Africa’s main site — not yet wired in this demo.)",
  ]
    .filter(Boolean)
    .join("\n");

  const mailto = `mailto:info@pilgrimafrica.org?subject=${encodeURIComponent(
    "Pilgrim Protect — sponsor inquiry"
  )}&body=${encodeURIComponent(mailBody)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl text-ink">Give toward the work</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          The v1 pilot does not process card payments on this site. Give
          through Pilgrim Africa’s established channels, or email us with the
          school you care about.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div>
          <label
            htmlFor="school"
            className="block text-sm font-medium text-ink mb-2"
          >
            School you have in mind (optional)
          </label>
          <select
            id="school"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="general">General — where need is greatest</option>
            {schools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} — {s.district}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-border bg-paper-soft p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-ink">Why not Stripe here?</strong> v1
            proves the map, school stories, and sponsor journey. Pilgrim’s
            finance team continues to use their main donation infrastructure
            until we intentionally add card checkout in a later release.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={base}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "secondary" }), "flex-1 justify-center")}
          >
            Give on pilgrimafrica.org
          </a>
          <a
            href={mailto}
            className={cn(buttonVariants({ variant: "outline" }), "flex-1 justify-center")}
          >
            Email us to sponsor
          </a>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Pilgrim Africa is a registered 501(c)(3) nonprofit. Configure{" "}
          <code className="text-[11px]">NEXT_PUBLIC_EXTERNAL_GIVING_URL</code>{" "}
          to point at your live giving page.
        </p>

        <div className="text-center pt-2">
          <Link
            href="/map"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Explore schools on the map
          </Link>
        </div>
      </div>
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
