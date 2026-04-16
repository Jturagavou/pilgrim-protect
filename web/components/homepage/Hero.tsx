import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

// Hero background image: Unsplash (free license) of a Ugandan classroom —
// swap for Dorothy's field photography when available. Attribution in
// web/public/images/README.md.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=2400&q=80";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-deep">
      <Image
        src={HERO_IMAGE}
        alt="Students outside a primary school in East Africa"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-55"
      />
      {/* Ink-to-transparent overlay keeps the headline legible over any image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-ink-deep/85 via-ink-deep/55 to-transparent"
      />
      <div className="relative mx-auto flex min-h-[560px] max-w-6xl flex-col justify-end px-6 pb-16 pt-24 md:min-h-[640px] md:pb-24 md:pt-32">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-paper/15 px-3 py-1 font-condensed text-xs uppercase tracking-wider text-paper ring-1 ring-paper/20 backdrop-blur">
          <MapPin className="size-3.5" aria-hidden />
          Uganda · Indoor Residual Spraying
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-paper sm:text-5xl md:text-6xl">
          Protect 100,000 students from malaria, one school at a time.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-paper/80 md:text-lg">
          Pilgrim Protect funds indoor residual spraying at Ugandan schools and
          publishes every report. One sponsored school, one documented spray,
          one verified count of students served.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/sponsor"
            className="inline-flex items-center gap-2 rounded-lg bg-pilgrim-blue px-5 py-3 font-medium text-white transition-colors hover:bg-pilgrim-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pilgrim-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep"
          >
            Sponsor a school
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-lg border border-paper/30 bg-paper/5 px-5 py-3 font-medium text-paper transition-colors hover:bg-paper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep"
          >
            See the map
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
