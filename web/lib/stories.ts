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
  imageUrl: string;
  imageAlt: string;
  imagePosition: string;
  tags: string[];
  focus: "testimony" | "first-service" | "vector-control" | "sustainability";
  body: string[];
}

export const stories: StoryEntry[] = [
  {
    slug: "beacon-of-hope-student-testimony",
    title: "A Beacon of Hope Student Leader on Learning After Spraying",
    excerpt:
      "A student leader describes how spraying classrooms and dormitories helped students spend less time sick and more time learning, leading, and participating in school life.",
    quote:
      "We no longer have to worry about falling ill and missing crucial lessons.",
    worker: "Student leader",
    district: "Soroti",
    dateLabel: "Public testimony",
    readingTime: "3 min read",
    schoolName: "Beacon of Hope",
    schoolFocus: "Classrooms, dormitories, and student learning time",
    imageUrl: "/images/pilgrim-protect/testimonial.jpg",
    imageAlt: "Pilgrim Protect student testimony from Beacon of Hope",
    imagePosition: "center 32%",
    tags: ["student-testimony", "irs", "school-health"],
    focus: "testimony",
    body: [
      "Pilgrim Africa’s public Pilgrim Protect page includes a testimony from a student leader and S6 candidate at Beacon of Hope. Before spraying, malaria was described as a persistent issue that made students miss learning time and struggle to keep up.",
      "After Pilgrim Protect sprayed classrooms and dormitories, the student leader described a significant reduction in malaria cases among students. The testimony connects the program directly to attendance, focus, extracurricular participation, and student leadership.",
      "For the donor site, this is the kind of story that matters most: malaria prevention is not only a health intervention. It protects the daily conditions that allow students to stay in class and build confidence in their school community.",
    ],
  },
  {
    slug: "subsidized-first-service",
    title: "Why Pilgrim Protect Starts With a Subsidized First Service",
    excerpt:
      "Many rural schools carry a high malaria burden without enough budget for vector control. Pilgrim Africa lowers the barrier by offering a first term of spray and protection service.",
    quote:
      "The first service opens the door for schools to compare the cost of prevention with the cost of illness.",
    worker: "Pilgrim Africa",
    district: "Amuria",
    dateLabel: "Program model",
    readingTime: "4 min read",
    schoolFocus: "Subsidized first term and shared de-identified data",
    imageUrl: "/images/pilgrim-protect/subsidized-service.jpg",
    imageAlt: "Pilgrim Protect subsidized first service at a school",
    imagePosition: "center center",
    tags: ["school-partnership", "cost-of-illness", "follow-up"],
    focus: "first-service",
    body: [
      "Pilgrim Africa explains that many rural schools in high-transmission areas do not budget for extensive vector-control activity, even when malaria causes a heavy health and financial burden.",
      "Pilgrim Protect offers the first term of spray and protection services for free, while schools partner by sharing de-identified malaria case information before and after the activities. Schools also participate in a business-case look at the cost of illness compared with the cost of prevention.",
      "After the first service, participating schools contribute to operational costs as they are able. That makes the program both practical for under-resourced schools and oriented toward long-term local ownership.",
    ],
  },
  {
    slug: "irs-and-school-protection",
    title: "Indoor Residual Spraying at the Center of School Protection",
    excerpt:
      "Pilgrim Protect focuses on primary and secondary schools with IRS, prevention education, malaria clubs, and youth champion activities.",
    quote:
      "IRS is presented by Pilgrim Africa as the single most effective malaria prevention intervention in Uganda.",
    worker: "Pilgrim Africa",
    district: "Amuria",
    dateLabel: "Program activities",
    readingTime: "3 min read",
    schoolFocus: "IRS, prevention education, malaria clubs, youth champions",
    imageUrl: "/images/pilgrim-protect/protect.jpg",
    imageAlt: "Pilgrim Protect school protection activity",
    imagePosition: "center center",
    tags: ["irs", "education", "malaria-clubs"],
    focus: "vector-control",
    body: [
      "The official Pilgrim Protect page describes a proactive approach to community protection, especially in primary and secondary schools. Indoor residual spraying is the central activity, supported by other prevention work.",
      "The program uses insecticides approved by WHO and Uganda’s Ministry of Health under Uganda’s Insecticide Resistance Management plan. Pilgrim Africa also notes that consistent IRS in high-transmission areas can reduce malaria infections in children dramatically.",
      "The donor site should therefore show more than a funding thermometer. It should help supporters understand what is happening on campus: rooms are sprayed, students receive prevention education, malaria clubs form, and young people become prevention champions.",
    ],
  },
  {
    slug: "sustainable-follow-up-and-cost",
    title: "The Cost Story Behind Sustainable Follow-Up",
    excerpt:
      "Pilgrim Africa frames long-term malaria prevention as something schools can budget for when they can see the health and financial case clearly.",
    quote:
      "$100 can protect 33 to 50 students for a year; $2,000 can protect an entire school of 650 to 1,000 students.",
    worker: "Pilgrim Africa",
    district: "Soroti",
    dateLabel: "Giving model",
    readingTime: "3 min read",
    schoolFocus: "Prevention cost, school budgets, and direct implementation",
    imageUrl: "/images/pilgrim-protect/sustainable-follow-up.jpg",
    imageAlt: "Pilgrim Protect sustainable follow-up with schools",
    imagePosition: "center center",
    tags: ["cost", "sustainability", "donor-impact"],
    focus: "sustainability",
    body: [
      "Pilgrim Africa’s public materials explain that spraying costs vary by school, including how many students sleep per room and the size of dorm rooms. The range is about $1 to $2 per student, with an additional one-time education element of about $1 per student.",
      "The page also says Pilgrim Africa board members subsidize program overhead so donations go directly to program implementation in schools. That is important donor-facing context and should be visible wherever this site asks for support.",
      "The sustainability goal is not simply to spray once. Participating schools are invited to compare prevention costs with illness costs and consider budgeting consistently for malaria prevention over time.",
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
