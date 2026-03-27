# Pilgrim Protect — Complete Requirements Extracted from PDF
## Every feature, page, workflow, and deliverable the client requested

*Pulled line-by-line from "Pilgrim Project.pdf" — nothing added, nothing assumed.*

---

## PROJECT IDENTITY

- **Name:** Interactive Storytelling Platform for Pilgrim Protect
- **Organization:** Pilgrim Africa
- **Initiative:** Pilgrim Protect
- **Branding:** "Malaria on the Brink" (with mosquito graphic in dark blue/teal)
- **Suggested domain:** protect.pilgrimafrica.org *(we're using pilgrimprotectstory.org)*
- **Target audience:** Donors, general public, Pilgrim Africa staff

---

## OBJECTIVES (4 stated goals)

1. **Educate and Engage Users** — Create an immersive experience showcasing malaria's impact, Pilgrim Protect's interventions, and success stories to inspire action
2. **Facilitate Sponsorships** — Enable donors to explore, select, and sponsor schools, with real-time updates on spraying progress and outcomes
3. **Promote Sustainability** — Illustrate the program's self-funding model through interactive visuals, demonstrating how donations multiply impact over time
4. **Build Capacity** — Develop a scalable platform that Pilgrim Africa staff can maintain and expand, incorporating user feedback for future features like email campaigns

---

## FEATURE AREA 1: Interactive Map

| # | Requirement (exact from PDF) | Type |
|---|---|---|
| 1.1 | Display high-burden districts in Uganda | Feature |
| 1.2 | Expandable to other African countries like Kenya or Tanzania | Architecture |
| 1.3 | Use Leaflet or Google Maps API to plot schools | Feature |
| 1.4 | Green markers for protected schools | Feature |
| 1.5 | Red markers for schools needing sponsors | Feature |
| 1.6 | Users can zoom | Feature |
| 1.7 | Users can filter by district | Feature |
| 1.8 | Users can filter by burden level | Feature |
| 1.9 | Click markers for details | Feature |
| 1.10 | Popup shows: school name | Feature |
| 1.11 | Popup shows: student count | Feature |
| 1.12 | Popup shows: malaria incidence data | Feature |
| 1.13 | Integrate public health data sources (e.g., WHO APIs) for real-time malaria burden stats | Feature / Integration |

---

## FEATURE AREA 2: School Profiles and Media Gallery

| # | Requirement (exact from PDF) | Type |
|---|---|---|
| 2.1 | Detailed pages for each school | Page |
| 2.2 | Photos of facilities | Content |
| 2.3 | Photos of spraying events | Content |
| 2.4 | Before/after comparisons | Feature |
| 2.5 | Embed videos of Pilgrim workers sharing on-the-ground stories | Feature |
| 2.6 | YouTube integration for video | Integration |
| 2.7 | Vimeo integration for video | Integration |
| 2.8 | Progress reports: charts showing malaria case reductions (using Chart.js) | Feature |
| 2.9 | Testimonials from teachers/students | Content |
| 2.10 | Impact metrics | Content / Feature |

---

## FEATURE AREA 3: Donor Tools

| # | Requirement (exact from PDF) | Type |
|---|---|---|
| 3.1 | Sponsorship portal: users browse schools | Page |
| 3.2 | View costs (e.g., $X for one spraying cycle) | Feature |
| 3.3 | Sponsor via integrated payment gateway (Stripe or PayPal) | Feature / Integration |
| 3.4 | Social media buttons to share school profiles | Feature |
| 3.5 | Social media buttons to share success stories | Feature |
| 3.6 | Personalized updates: donors receive email notifications when spraying occurs | Feature / Workflow |
| 3.7 | Email notifications include photos and reports | Feature |
| 3.8 | Automated email campaign series: welcome | Workflow |
| 3.9 | Automated email campaign series: progress updates | Workflow |
| 3.10 | Automated email campaign series: renewal reminders | Workflow |

---

## FEATURE AREA 4: Storytelling Elements

| # | Requirement (exact from PDF) | Type |
|---|---|---|
| 4.1 | Narrative sections explaining the model | Content / Page |
| 4.2 | Interactive timeline showing how one sponsorship grows (e.g., Year 1: 1 school; Year 2: 2 schools via partial local funding) | Feature |
| 4.3 | Blog-style updates from field teams | Page / Feature |
| 4.4 | Options for user comments | Feature |
| 4.5 | Options for Q&A | Feature |
| 4.6 | Mobile-friendly design | Requirement |
| 4.7 | Alt text for images | Accessibility |
| 4.8 | Multilingual support: English | Requirement |
| 4.9 | Multilingual support: local Ugandan languages | Requirement |

---

## EXPLICITLY OUT OF SCOPE (in red text in PDF)

- Full e-commerce setup (focus on prototype integration)
- Advanced AI analytics
- Physical hardware

---

## TECHNICAL REQUIREMENTS

| # | Requirement (exact from PDF) | Category |
|---|---|---|
| T.1 | Frontend: HTML/CSS/JavaScript with React or Vue for interactivity | Tech |
| T.2 | Responsive design via Bootstrap or Tailwind | Tech |
| T.3 | Backend: Node.js for API endpoints (e.g., fetching school data) | Tech |
| T.4 | Authentication for donor accounts | Tech |
| T.5 | Data Management: Store school info, donor details, and media in a cloud database | Tech |
| T.6 | Use AWS S3 or similar for image/video hosting | Tech |
| T.7 | Security: Implement HTTPS | Tech |
| T.8 | Security: Data encryption | Tech |
| T.9 | Security: Basic user privacy (GDPR-compliant) | Tech |
| T.10 | Tools: Git for version control | Tech |
| T.11 | Tools: Basic UI/UX design (Figma for prototypes) | Process |
| T.12 | Content sourcing from Pilgrim Africa team | Process |

---

## TIMELINE (8-Week Sprint)

| Weeks | Phase | Deliverables |
|---|---|---|
| 1-2 | Research and Planning | Gather requirements, design wireframes, source initial data (school lists, photos) |
| 3-4 | Development | Build core map and school profiles; integrate media |
| 5-6 | Add Interactivity | Implement sponsorship tools, sharing, and basic email mockups |
| 7-8 | Testing and Polish | User testing, bug fixes, documentation for handover; demo to Pilgrim Africa |

---

## TEAM ROLES (defined in PDF)

| Role | Responsibility |
|---|---|
| Project Lead | Coordinates tasks, liaises with Pilgrim Africa |
| Developer(s) (2-3 members) | Handles coding for map, backend, and integrations |
| Designer/Content Creator | Creates visuals, writes narratives, sources media |
| Tester/Analyst | Ensures functionality, gathers feedback, measures usability |

---

## SUCCESS METRICS & DELIVERABLES

### Quantitative
- Platform prototype with at least 10 sample schools
- 80%+ user satisfaction in testing
- Simulated sponsorship flow

### Qualitative
- Engaging storytelling that clearly conveys the scaling model
- Flexible codebase for future additions (e.g., email campaigns)

### Required Deliverables
1. Deployed demo site
2. Source code repository
3. User guide
4. Presentation deck

---

## IMPLICIT REQUIREMENTS (not stated as features but mentioned in context)

These are things the PDF mentions in passing or implies through its descriptions:

| # | Implied Requirement | Where in PDF |
|---|---|---|
| I.1 | The scaling model visualization: "a donor sponsoring one school in year one could enable funding for two schools in year two through efficient resource allocation" | Project Overview paragraph |
| I.2 | Platform should be modular for "easy additions like email campaigns or expansions to other African countries" | Project Overview paragraph |
| I.3 | The platform should "tell Pilgrim Protect's story" — storytelling is the primary purpose, not just data display | Project Overview paragraph |
| I.4 | Platform should "engage donors, highlight progress, and facilitate sponsorships" — these are the 3 core user actions | Project Overview paragraph |
| I.5 | Emphasizes "visual storytelling through maps, images, videos, and reports" | Project Overview paragraph |
| I.6 | "Integrating tools for sharing and updates" — sharing is a core feature, not an afterthought | Project Overview paragraph |
| I.7 | Platform that "Pilgrim Africa staff can maintain and expand" — implies admin/CMS capability | Objective 4 |
| I.8 | "Incorporating user feedback for future features" — implies some feedback mechanism | Objective 4 |
| I.9 | "Real-time updates on spraying progress and outcomes" — implies live data or frequently updated data | Objective 2 |
| I.10 | "Flexible, interactive web-based platform" — not a static site | Project Overview |
| I.11 | Budget is minimal (free tools) but "potential for Pilgrim Africa to provide data and feedback" | Last sentence |
| I.12 | "Responsive web app" — explicitly called a web app, not just a website | Scope and Features intro |

---

## COMPLETE FEATURE COUNT

| Category | Count |
|---|---|
| Interactive Map features | 13 |
| School Profile features | 10 |
| Donor Tool features | 10 |
| Storytelling features | 9 |
| Technical requirements | 12 |
| Implicit requirements | 12 |
| **Total identified requirements** | **66** |

---

## GAPS & QUESTIONS

Things the PDF does NOT specify that we need to decide:

1. **No mention of a landing/home page** — the PDF jumps straight to features. We need to design what visitors see first.
2. **No admin panel specified** — but Objective 4 says "staff can maintain and expand." How do they add schools, update data, post stories?
3. **No donor dashboard specified** — the PDF mentions donors receive email updates, but nothing about logging in to see their sponsorships.
4. **No account management** — the PDF says "authentication for donor accounts" but doesn't describe registration flow, password reset, profile editing.
5. **"Real-time" is ambiguous** — does it mean WebSocket live updates, or just "data that's regularly updated"?
6. **WHO API integration scope** — how deep? Just display stats, or pull data automatically and refresh?
7. **Comments and Q&A** (4.4, 4.5) — moderated? Anonymous? Requires login?
8. **Multilingual** — which Ugandan languages specifically? Luganda? Acholi? Multiple?
9. **"Simulated sponsorship flow"** — suggests payment doesn't need to be real for the prototype. Test mode?
10. **Presentation deck** — is this a deliverable we make about the project, or a feature of the platform?
11. **User guide** — for donors using the site, or for Pilgrim Africa staff maintaining it?
12. **Before/after comparisons** — simple side-by-side photos, or an interactive slider?
13. **Cost per spraying cycle** — who sets this? Fixed? Per-school?

---

## BUILD PLAN COVERAGE CHECK

How our current build plan maps to each PDF requirement:

### Interactive Map — FULLY COVERED
| Req | PDF Says | Build Plan Status |
|---|---|---|
| 1.1 Display high-burden districts in Uganda | ✅ Phase 1 — map centered on Uganda |
| 1.2 Expandable to other countries | ✅ Architecture supports it (modular data model) |
| 1.3 Leaflet or Google Maps | ✅ React Leaflet chosen |
| 1.4 Green markers for protected | ✅ Phase 1 — color-coded markers |
| 1.5 Red markers needing sponsors | ✅ Phase 1 — color-coded markers |
| 1.6 Zoom | ✅ Leaflet default |
| 1.7 Filter by district | ✅ Phase 1 — filter sidebar |
| 1.8 Filter by burden level | ✅ Phase 1 — filter sidebar |
| 1.9 Click for details | ✅ Phase 1 — marker popups |
| 1.10 School name in popup | ✅ Phase 1 |
| 1.11 Student count in popup | ✅ Phase 1 |
| 1.12 Malaria incidence in popup | ✅ Phase 1 |
| 1.13 WHO API integration | ⚠️ PARTIALLY — mentioned in data sources table but no specific implementation step |

### School Profiles — FULLY COVERED
| Req | PDF Says | Build Plan Status |
|---|---|---|
| 2.1 Detailed school pages | ✅ Phase 2 — school profile page |
| 2.2 Photos of facilities | ✅ Phase 2 — photo gallery |
| 2.3 Photos of spraying events | ✅ Phase 2 — photo gallery |
| 2.4 Before/after comparisons | ✅ Phase 2 — before/after gallery |
| 2.5 Embed field worker videos | ✅ Phase 2 — video embed component |
| 2.6 YouTube integration | ✅ Phase 2 |
| 2.7 Vimeo integration | ✅ Phase 2 |
| 2.8 Chart.js malaria case charts | ✅ Phase 2 — Chart.js integration |
| 2.9 Testimonials | ✅ Phase 2 — testimonial display |
| 2.10 Impact metrics | ✅ Phase 2 — key stats bar |

### Donor Tools — MOSTLY COVERED
| Req | PDF Says | Build Plan Status |
|---|---|---|
| 3.1 Browse schools to sponsor | ✅ Phase 3 — sponsorship portal |
| 3.2 View costs per spraying cycle | ✅ Phase 3 — cost display |
| 3.3 Payment gateway (Stripe/PayPal) | ✅ Phase 3 — Stripe checkout |
| 3.4 Social sharing for school profiles | ✅ Phase 2 — sharing buttons |
| 3.5 Social sharing for success stories | ⚠️ MISSING — sharing on stories/blog page not explicitly planned |
| 3.6 Email when spraying occurs | ⚠️ PARTIALLY — email system in Phase 4 but "spraying occurred" trigger not defined |
| 3.7 Emails include photos and reports | ⚠️ PARTIALLY — email content not detailed in plan |
| 3.8 Automated welcome email | ✅ Phase 4 — email series |
| 3.9 Automated progress update emails | ✅ Phase 4 — email series |
| 3.10 Automated renewal reminder emails | ✅ Phase 4 — email series |

### Storytelling — GAPS FOUND
| Req | PDF Says | Build Plan Status |
|---|---|---|
| 4.1 Narrative sections explaining the model | ✅ Landing page "How It Works" |
| 4.2 Interactive timeline (Year 1→Year 2 growth) | ✅ Landing page scaling timeline |
| 4.3 Blog-style field team updates | ✅ Phase 4 — stories section |
| 4.4 User comments on blog posts | ❌ MISSING — not in any phase |
| 4.5 Q&A section | ❌ MISSING — not in any phase |
| 4.6 Mobile-friendly design | ✅ Tailwind responsive throughout |
| 4.7 Alt text for images | ✅ Phase 4 — accessibility pass |
| 4.8 English language | ✅ Default |
| 4.9 Local Ugandan languages | ⚠️ PARTIALLY — mentioned in Section 8 (i18n plan) but no implementation step in phases |

### Technical Requirements — FULLY COVERED
| Req | PDF Says | Build Plan Status |
|---|---|---|
| T.1 React or Vue frontend | ✅ Next.js (React) |
| T.2 Bootstrap or Tailwind | ✅ Tailwind CSS |
| T.3 Node.js backend | ✅ Express API |
| T.4 Donor authentication | ✅ NextAuth.js |
| T.5 Cloud database | ✅ MongoDB Atlas |
| T.6 Image hosting (S3 or similar) | ✅ Cloudinary |
| T.7 HTTPS | ✅ Vercel auto-SSL |
| T.8 Data encryption | ⚠️ PARTIALLY — not explicitly detailed in plan |
| T.9 GDPR compliance | ⚠️ PARTIALLY — mentioned in security review but no specific implementation |
| T.10 Git | ✅ Assumed |
| T.11 Figma prototypes | ❌ NOT PLANNED — no wireframing/design step before coding |
| T.12 Content from Pilgrim Africa | ⚠️ PENDING — listed in "Decisions to Make" but no process defined |

### Deliverables — GAPS FOUND
| Req | PDF Says | Build Plan Status |
|---|---|---|
| D.1 Deployed demo site | ✅ Phase 4 — deploy to Vercel + Railway |
| D.2 Source code repository | ✅ Git repo (assumed) |
| D.3 User guide | ❌ MISSING — not in any phase |
| D.4 Presentation deck | ❌ MISSING — not in any phase |

---

## SUMMARY: WHAT'S MISSING FROM OUR BUILD PLAN

### Must Add (client explicitly requested)
1. **User comments on blog/stories** (4.4) — need a comment system
2. **Q&A section** (4.5) — need a Q&A feature on stories or school pages
3. **User guide document** (D.3) — deliverable for handover
4. **Presentation deck** (D.4) — deliverable for demo to Pilgrim Africa
5. **Social sharing on stories page** (3.5) — sharing buttons on blog posts, not just school profiles

### Should Strengthen (partially covered)
6. **WHO API integration** (1.13) — needs a concrete implementation step, not just "data sources"
7. **Spraying event email trigger** (3.6) — needs a workflow: when school status updates to "sprayed," email the sponsor
8. **Email content with photos/reports** (3.7) — email templates need to be rich, not just text
9. **Multilingual/i18n** (4.8-4.9) — needs to be a phase task, not just a plan section
10. **GDPR compliance** (T.9) — needs specific steps: cookie consent, data deletion, privacy policy page
11. **Data encryption** (T.8) — needs specifics: encrypted at rest (MongoDB), in transit (HTTPS), password hashing
12. **Figma prototypes/wireframes** (T.11) — PDF requests this as part of Weeks 1-2 planning
13. **Content sourcing process** (T.12) — need a clear plan for getting school data, photos, stories from Pilgrim Africa

### Nice to Plan For (implied but not explicit)
14. **Admin panel / CMS** (I.7) — PDF says "staff can maintain and expand" — they need a way to manage content
15. **Landing/home page** — PDF doesn't specify one, but it's clearly needed
16. **Donor dashboard** — PDF doesn't specify but implies donors have accounts and receive updates
17. **Feedback mechanism** (I.8) — "incorporating user feedback" — contact form? Survey? In-app feedback?
