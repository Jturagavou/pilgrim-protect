import Hero from "@/components/homepage/Hero";
import ContextCards from "@/components/homepage/ContextCards";
import HowItWorks from "@/components/homepage/HowItWorks";
import CtaBanner from "@/components/homepage/CtaBanner";
import { ProgressTo100k } from "@/components/ProgressTo100k";
import { StatTriad } from "@/components/StatTriad";
import { fetchSummaryStats } from "@/lib/stats.server";

// Revalidate stats every 60s; everything else is static.
export const revalidate = 60;

export default async function HomePage() {
  const stats = await fetchSummaryStats();

  return (
    <>
      <Hero />

      <section id="progress" className="bg-paper py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl">
            <p className="font-condensed text-xs uppercase tracking-widest text-pilgrim-blue">
              The running total
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Every number on this site comes from a verified field report.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Updated every minute from the spray log.
            </p>
          </div>

          <div className="mt-10">
            <ProgressTo100k
              current={stats.studentsCovered}
              goal={stats.goal}
            />
          </div>

          <div className="mt-10">
            <StatTriad
              schoolsProtected={stats.schoolsProtected}
              studentsCovered={stats.studentsCovered}
              dollarsRaised={stats.dollarsRaised}
            />
          </div>
        </div>
      </section>

      <ContextCards />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
