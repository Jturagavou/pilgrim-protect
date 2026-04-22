import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, MapPin, Quote } from "lucide-react";
import type { ReactNode } from "react";
import { getStoryBySlug, stories } from "@/lib/stories";

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();
  const related = stories.filter((entry) => entry.slug !== story.slug).slice(0, 3);

  return (
    <article className="bg-paper">
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,109,35,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.45),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm font-medium text-pilgrim-orange-deep hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to stories
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="font-condensed text-xs uppercase tracking-[0.24em] text-pilgrim-orange">
                {story.district} · {story.dateLabel}
              </p>
              <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight text-ink sm:text-5xl">
                {story.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {story.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_18px_42px_rgba(45,45,45,0.08)]">
                <div className="flex items-center gap-2 text-pilgrim-orange">
                  <Quote className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Field voice
                  </span>
                </div>
                <blockquote className="mt-4 text-2xl leading-tight text-ink">
                  “{story.quote}”
                </blockquote>
                <p className="mt-5 text-sm uppercase tracking-[0.14em] text-muted-foreground">
                  {story.worker}
                  {story.schoolName ? ` · ${story.schoolName}` : ""}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard
                  icon={<MapPin className="h-4 w-4 text-pilgrim-orange" />}
                  label="District"
                  value={story.district}
                />
                <InfoCard
                  icon={<Clock3 className="h-4 w-4 text-pilgrim-orange" />}
                  label="Reading time"
                  value={story.readingTime}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {story.schoolFocus ? (
              <div className="rounded-[1.75rem] border border-pilgrim-orange/15 bg-pilgrim-orange/8 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pilgrim-orange">
                  School focus
                </p>
                <p className="mt-3 text-base leading-8 text-ink/90">{story.schoolFocus}</p>
              </div>
            ) : null}

            <div className="mt-8 space-y-6 text-[1.04rem] leading-8 text-ink/90">
              {story.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.6rem] border border-border bg-card p-5">
              <p className="font-condensed text-xs uppercase tracking-[0.2em] text-pilgrim-orange">
                Why this story matters
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The public narrative is strongest when donors can connect worker
                voice, district context, and documented follow-through in one place.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-border bg-card p-5">
              <p className="font-condensed text-xs uppercase tracking-[0.2em] text-pilgrim-orange">
                Related stories
              </p>
              <div className="mt-4 space-y-3">
                {related.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/stories/${entry.slug}`}
                    className="group block rounded-2xl border border-border bg-paper-soft px-4 py-4 transition-colors hover:bg-paper-depth"
                  >
                    <p className="text-sm font-semibold text-ink">{entry.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {entry.district} · {entry.readingTime}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-pilgrim-orange-deep">
                      Read next
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value}</p>
    </div>
  );
}
