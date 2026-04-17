"use client";

const stories = [
  {
    id: 1,
    worker: "James Okello",
    title: "A Morning in Gulu",
    excerpt:
      "The sun was barely up when James arrived at Gulu Primary School with his spraying equipment. By 7 AM, he had covered three classrooms — each one protecting dozens of children from malaria-carrying mosquitoes.",
    quote:
      "When the headmaster told me that absences dropped by half after our last round, I knew this work matters more than anything.",
    district: "Gulu",
    date: "March 2026",
  },
  {
    id: 2,
    worker: "Sarah Apio",
    title: "The Iganga Breakthrough",
    excerpt:
      "Sarah's team had been waiting weeks for supplies. When they finally arrived, she sprayed all 11 rooms at Iganga Community School in a single day — setting a new record for the program.",
    quote:
      "These children deserve a classroom where they can learn without fear of falling sick. That's what drives me every day.",
    district: "Iganga",
    date: "March 2026",
  },
  {
    id: 3,
    worker: "Grace Nambi",
    title: "Reaching Mbale's Hill Schools",
    excerpt:
      "Getting equipment up to Mbale Hill View Primary isn't easy. Grace carried supplies on foot for the final kilometer. But when she saw the students' faces, she knew the climb was worth it.",
    quote:
      "Malaria took my cousin when we were children. Now I have the power to protect other families from that pain.",
    district: "Mbale",
    date: "March 2026",
  },
  {
    id: 4,
    worker: "Peter Ouma",
    title: "Second Chances in Soroti",
    excerpt:
      "When Peter's first visit to Soroti Central was cut short by supply issues, he promised he'd return. Two weeks later, he did — completing the spray and earning the trust of the entire community.",
    quote:
      "A promise made is a promise kept. These communities are counting on us.",
    district: "Soroti",
    date: "January 2026",
  },
  {
    id: 5,
    worker: "David Waiswa",
    title: "Jinja's Largest School",
    excerpt:
      "With 15 rooms and over 600 students, Jinja Riverside Academy was the biggest job of the season. David split it into two phases, meticulously documenting every room sprayed.",
    quote:
      "Transparency matters. When donors can see exactly where their money goes, they give with confidence — and children benefit.",
    district: "Jinja",
    date: "March 2026",
  },
  {
    id: 6,
    worker: "Moses Okiror",
    title: "Tororo's Forgotten Corner",
    excerpt:
      "Tororo Border Primary hadn't been sprayed in months. Moses identified it as the highest-priority school in his district and mobilized to get it back on schedule.",
    quote:
      "No school should fall through the cracks. Every child deserves protection, no matter how remote.",
    district: "Tororo",
    date: "November 2025",
  },
];

export default function StoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-ink">
          Stories from the Field
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Behind every spray report is a real person working to protect children.
          These are their stories.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <article
            key={story.id}
            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header with worker avatar */}
            <div className="bg-gradient-to-r from-primary to-primary/85 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {story.worker
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{story.worker}</p>
                  <p className="text-primary-foreground/80 text-xs">
                    {story.district} &middot; {story.date}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-semibold text-ink mb-2">{story.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {story.excerpt}
              </p>
              <blockquote className="mt-4 pl-3 border-l-2 border-primary/40">
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </blockquote>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
