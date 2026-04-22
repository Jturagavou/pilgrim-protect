export interface StoryEntry {
  slug: string;
  title: string;
  excerpt: string;
  quote: string;
  worker: string;
  district: string;
  dateLabel: string;
  readingTime: string;
  schoolName?: string;
  schoolFocus?: string;
  tags: string[];
  focus: "return-visit" | "hard-to-reach" | "documentation" | "follow-up";
  body: string[];
}

export const stories: StoryEntry[] = [
  {
    slug: "soroti-return-visit",
    title: "Returning to Soroti After a Missed Visit",
    excerpt:
      "A field team came back to finish work they could not complete the first time, turning a delayed visit into a moment of trust with the school community.",
    quote:
      "A promise made is a promise kept. These communities are counting on us.",
    worker: "Peter Ouma",
    district: "Soroti",
    dateLabel: "January 2026",
    readingTime: "3 min read",
    schoolName: "Soroti Central",
    schoolFocus: "Follow-up visit and trust repair",
    tags: ["follow-up", "accountability", "field-visit"],
    focus: "return-visit",
    body: [
      "The first visit to Soroti Central did not go the way the team had hoped. Supplies ran short before every classroom could be covered, and the school was left waiting for a return date.",
      "Instead of letting that gap become a broken promise, the team scheduled a follow-up and came back prepared. That second visit mattered as much for trust as it did for spraying itself.",
      "For Pilgrim Protect, this kind of return is part of the story. Protecting students is not only about a single day of work; it is about showing up again, documenting what happened, and making sure a school is not forgotten once it slips off the first schedule.",
    ],
  },
  {
    slug: "mbale-hill-schools",
    title: "Reaching the Hill Schools Outside Mbale",
    excerpt:
      "A long final walk with equipment became a reminder that distance is part of the cost of protecting students in harder-to-reach communities.",
    quote:
      "When the climb is finished and the classrooms are covered, you remember why every extra step matters.",
    worker: "Grace Nambi",
    district: "Mbale",
    dateLabel: "March 2026",
    readingTime: "4 min read",
    schoolName: "Mbale Hill View Primary",
    schoolFocus: "Transport burden and reach",
    tags: ["transport", "rural-access", "field-logistics"],
    focus: "hard-to-reach",
    body: [
      "The road did not go all the way to the school. For the last stretch, equipment had to be carried in by hand, one load at a time.",
      "That is the kind of detail donors rarely see in a spreadsheet. Distance adds labor, time, and coordination, especially when a team is trying to keep a full district schedule moving.",
      "Stories like this are why the platform needs more than a marker on a map. Each school has a practical reality around transport, follow-up, and timing, and those realities shape what it takes to keep students protected over time.",
    ],
  },
  {
    slug: "jinja-large-campus",
    title: "Documenting a Larger Campus in Jinja",
    excerpt:
      "A larger school required more careful pacing and documentation, showing how transparency and field reporting reinforce donor trust.",
    quote:
      "When people can see what happened in each room, they understand that this work is real.",
    worker: "David Waiswa",
    district: "Jinja",
    dateLabel: "March 2026",
    readingTime: "3 min read",
    schoolName: "Jinja Riverside Academy",
    schoolFocus: "Evidence, pacing, and room-level reporting",
    tags: ["documentation", "evidence", "reporting"],
    focus: "documentation",
    body: [
      "A larger campus changes the rhythm of a field day. More rooms means more coordination, more documentation, and more care to make sure nothing is skipped.",
      "For the team in Jinja, the work was split into phases so that the school could be covered methodically. Notes, photos, and room counts all mattered, because field evidence is part of what makes the platform trustworthy.",
      "This is also where the mobile reporting workflow becomes central. The quality of the public story depends on the quality of the field record behind it.",
    ],
  },
  {
    slug: "tororo-forgotten-corner",
    title: "The School That Nearly Slipped Off the Map",
    excerpt:
      "A delayed school visit in Tororo became a reminder that systems matter most when they catch what would otherwise be missed.",
    quote:
      "No school should fall through the cracks. Every child deserves protection, no matter how remote.",
    worker: "Moses Okiror",
    district: "Tororo",
    dateLabel: "November 2025",
    readingTime: "3 min read",
    schoolName: "Tororo Border Primary",
    schoolFocus: "Operational recovery and visibility",
    tags: ["follow-up", "operations", "school-recovery"],
    focus: "follow-up",
    body: [
      "Some of the most important work a program does is invisible. It is not only the spraying itself, but the schedule correction, the follow-up call, and the rediscovery of a school that has been left waiting too long.",
      "In Tororo, that meant identifying a school that had slipped behind and pulling it back into the operational picture. The action sounds simple, but it depends on records being clear and field teams having a way to report what is really happening on the ground.",
      "The fuller version of this product should make those moments visible, because they say something essential about stewardship and accountability.",
    ],
  },
];

export function getStoryBySlug(slug: string): StoryEntry | undefined {
  return stories.find((story) => story.slug === slug);
}

export function getStoriesByDistrict(district: string): StoryEntry[] {
  return stories.filter(
    (story) => story.district.toLowerCase() === district.toLowerCase()
  );
}
