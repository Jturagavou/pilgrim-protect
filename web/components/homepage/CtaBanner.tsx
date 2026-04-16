import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-paper md:text-4xl">
            $1,000 protects one school for a year.
          </h2>
          <p className="mt-3 text-paper/70">
            Pick a specific school, fund one spray cycle, and watch it move from
            needs-funding to data-gathered on the map.
          </p>
        </div>
        <Link
          href="/sponsor"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-pilgrim-orange px-5 py-3 font-medium text-white transition-colors hover:bg-pilgrim-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pilgrim-orange focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Start sponsoring
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

export default CtaBanner;
