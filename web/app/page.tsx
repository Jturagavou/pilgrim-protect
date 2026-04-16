import Hero from "@/components/homepage/Hero";
import ContextCards from "@/components/homepage/ContextCards";
import HowItWorks from "@/components/homepage/HowItWorks";
import CtaBanner from "@/components/homepage/CtaBanner";
import { fetchSummaryStats } from "@/lib/stats.server";

// Revalidate stats every 60s; everything else is static.
export const revalidate = 60;

export default async function HomePage() {
  const stats = await fetchSummaryStats();

  return (
    <>
      <Hero stats={stats} />
      <ContextCards />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
