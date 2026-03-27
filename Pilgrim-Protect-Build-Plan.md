# Pilgrim Protect Story — Build Plan
## pilgrimprotectstory.org

---

## 1. What We're Building

An interactive storytelling web platform for Pilgrim Protect (by Pilgrim Africa) that does three things:

1. **Tells the story** — educates visitors about malaria's impact in Uganda and how Pilgrim Protect's school spraying program works
2. **Connects donors to schools** — lets people browse, select, and sponsor specific schools through an interactive map
3. **Shows real impact** — displays progress data, photos, videos, and testimonials from the ground

Later (Phase 2), a mobile app for field workers in Uganda to upload photos, update school data, and report spraying progress.

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 (App Router) | Server-side rendering for SEO, React-based, great DX, deploys to Vercel |
| **Styling** | Tailwind CSS 4 | Utility-first, fast to build with, responsive out of the box |
| **Interactive Map** | Mapbox GL JS + react-map-gl + Mapbox Studio | WebGL rendering (60fps), custom branded map styles, 3D terrain, 50K free loads/mo, nonprofit program available |
| **Charts** | Chart.js + react-chartjs-2 | Simple, well-documented, perfect for malaria case reduction charts |
| **Backend API** | Node.js + Express | Shared API for both web and future mobile app |
| **Database** | MongoDB Atlas (free tier) | 512MB free, flexible document model fits school/donor data well |
| **Image Storage** | Cloudinary (free tier) | 25GB storage, auto image optimization, responsive transforms |
| **Video** | YouTube/Vimeo embeds | Free, no hosting cost, already suggested in project brief |
| **Payments** | Stripe (nonprofit rate) | 2.2% + $0.30 per donation, recurring support, donor portal |
| **Email** | Brevo (free tier) | 300 emails/day free, transactional + marketing, better free tier than Mailchimp |
| **Auth** | NextAuth.js (Auth.js) | Simple donor login, supports email/password and social logins |
| **Hosting (dev)** | MacBook + Tailscale | Free, private team access during development |
| **Hosting (prod)** | Vercel (frontend) + Railway (backend) | ~$5-7/month total |

### Why Mapbox over Leaflet?
Leaflet is free and works, but it renders raster image tiles that pixelate between zoom levels and can't match the smoothness of WebGL. Mapbox GL JS renders vector tiles on the GPU at 60fps — buttery smooth zoom, pan, and flyTo animations. More importantly, **Mapbox Studio** lets us design a custom branded map style (terrain colors, district highlights, label styles) so the map feels like *Pilgrim Protect's map*, not a generic map with pins. The free tier (50K map loads/month) covers our traffic for years. Fallback: react-map-gl supports both Mapbox and MapLibre, so if pricing becomes an issue we swap one import line — all custom components stay the same.

---

## 3. Project Structure

```
pilgrim-protect/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout (nav, footer, fonts)
│   │   │   ├── page.tsx             # Landing / home page
│   │   │   ├── map/
│   │   │   │   └── page.tsx         # Interactive map page
│   │   │   ├── schools/
│   │   │   │   ├── page.tsx         # School listing/browse
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Individual school profile
│   │   │   ├── sponsor/
│   │   │   │   ├── page.tsx         # Sponsorship portal
│   │   │   │   └── checkout/
│   │   │   │       └── page.tsx     # Stripe checkout flow
│   │   │   ├── stories/
│   │   │   │   ├── page.tsx         # Blog / field updates
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     # Individual story
│   │   │   ├── about/
│   │   │   │   └── page.tsx         # About Pilgrim Protect
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Donor dashboard (my sponsorships)
│   │   │   └── api/                 # Next.js API routes (proxies to backend)
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI (buttons, cards, modals)
│   │   │   ├── map/                 # Map-specific components
│   │   │   ├── school/              # School card, profile components
│   │   │   ├── donor/               # Sponsorship, payment components
│   │   │   └── layout/              # Nav, footer, sidebar
│   │   ├── lib/
│   │   │   ├── api.ts               # API client functions
│   │   │   ├── utils.ts             # Helper functions
│   │   │   └── constants.ts         # Config, map coordinates, etc.
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── public/
│   │   │   ├── images/              # Static images, logo, branding
│   │   │   └── fonts/               # Custom fonts if needed
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── api/                    # Express backend API
│       ├── src/
│       │   ├── server.ts            # Express app entry point
│       │   ├── routes/
│       │   │   ├── schools.ts       # /api/schools endpoints
│       │   │   ├── sprayRecords.ts  # /api/schools/:id/spray-records + /api/spray-records
│       │   │   ├── malariaData.ts   # /api/malaria-data (MAP/WHO context layer)
│       │   │   ├── donors.ts        # /api/donors endpoints
│       │   │   ├── sponsorships.ts  # /api/sponsorships endpoints
│       │   │   ├── stories.ts       # /api/stories endpoints
│       │   │   ├── payments.ts      # /api/payments (Stripe webhooks)
│       │   │   └── uploads.ts       # /api/uploads (image upload)
│       │   ├── models/
│       │   │   ├── School.ts        # School MongoDB model (baseline record)
│       │   │   ├── SprayRecord.ts   # Spray event log (field worker input)
│       │   │   ├── MalariaContext.ts # District-level MAP/WHO data
│       │   │   ├── Donor.ts         # Donor model
│       │   │   ├── Sponsorship.ts   # Sponsorship model
│       │   │   └── Story.ts         # Blog/update model
│       │   ├── middleware/
│       │   │   ├── auth.ts          # JWT authentication
│       │   │   └── upload.ts        # Multer + Cloudinary
│       │   ├── services/
│       │   │   ├── stripe.ts        # Stripe payment logic
│       │   │   ├── email.ts         # Email sending service
│       │   │   └── cloudinary.ts    # Image upload service
│       │   └── config/
│       │       └── db.ts            # MongoDB connection
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                 # Shared types and utilities
│       ├── types/                   # TypeScript types used by web + api
│       └── validators/              # Zod schemas for data validation
│
├── package.json                # Root package.json (workspaces)
├── turbo.json                  # Turborepo config (optional)
└── README.md
```

### Why this structure?
- **Monorepo with `apps/` and `packages/`** — keeps web and API in one repo while sharing types and validation logic. When we add the mobile app later, it slots in as `apps/mobile/`.
- **Shared types** — the School, Donor, and Sponsorship types are defined once and used by both frontend and backend. No drift.
- **Express as a separate app** — not embedded in Next.js API routes. This keeps the API independent so the mobile app can call the same endpoints.

---

## 4. Database Schema (MongoDB)

### Schools Collection (baseline — rarely changes)
```json
{
  "_id": "ObjectId",
  "name": "Nakaseke Primary School",
  "district": "Nakaseke",
  "subCounty": "Nakaseke Town Council",
  "region": "Central",
  "coordinates": { "lat": 0.7167, "lng": 32.3833 },
  "studentCount": 450,
  "buildingCount": 8,              // classrooms + office buildings
  "contactPerson": { "name": "Grace N.", "role": "Head Teacher", "phone": "+256..." },
  // STATUS IS COMPUTED by the API from SprayRecords — not stored here
  // Green: sprayed within 6 months, Yellow: 6-12 months, Red: >12 months or never
  "malariaBaseline": {
    "casesBeforeFirstSpray": 158,  // historical — from before Pilgrim Africa's first visit
    "incidenceRateBaseline": 35.2  // cases per 1000 students, pre-intervention
  },
  "photos": [
    { "url": "https://res.cloudinary.com/...", "caption": "School entrance", "type": "before" }
  ],
  "videos": [
    { "url": "https://youtube.com/...", "title": "Teacher testimonial" }
  ],
  "testimonials": [
    { "author": "Grace N., Head Teacher", "text": "Since the spraying, attendance has improved..." }
  ],
  "sprayingHistory": [
    { "date": "2025-06-15", "sponsor": "donorId", "cost": 500, "cycle": 1 }
  ],
  "costPerCycle": 500,             // USD for one spraying cycle
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### Donors Collection
```json
{
  "_id": "ObjectId",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "passwordHash": "...",
  "stripeCustomerId": "cus_...",
  "sponsorships": ["sponsorshipId1", "sponsorshipId2"],
  "totalDonated": 1500,
  "joinedAt": "ISODate"
}
```

### Sponsorships Collection
```json
{
  "_id": "ObjectId",
  "donorId": "ObjectId",
  "schoolId": "ObjectId",
  "amount": 500,
  "status": "active",              // "active" | "completed" | "cancelled"
  "type": "one_time",              // "one_time" | "recurring"
  "stripePaymentId": "pi_...",
  "stripeSubscriptionId": "sub_...",  // for recurring
  "cycle": 1,
  "createdAt": "ISODate"
}
```

### SprayRecords Collection (dynamic — created by field workers)
```json
{
  "_id": "ObjectId",
  "schoolId": "ObjectId",
  "date": "2025-06-15",
  "buildingsSprayed": 6,           // how many of the school's buildings were covered
  "totalBuildings": 8,             // total buildings at the school (snapshot at time of spray)
  "insecticideUsed": "Pirimiphos-methyl (Actellic 300CS)",
  "teamMembers": ["John K.", "Sarah M."],
  "malariaCasesAtTime": 42,        // current malaria cases at the school
  "photos": [
    { "url": "https://res.cloudinary.com/...", "caption": "Classroom 3 sprayed", "type": "during" }
  ],
  "notes": "Two classrooms inaccessible due to renovation, will return next week",
  "gpsConfirmed": true,            // did the mobile app GPS match the school coordinates?
  "sponsorId": "ObjectId",         // which donor funded this cycle (if applicable)
  "cycle": 1,                      // which spray cycle in the year (1st, 2nd, etc.)
  "submittedVia": "admin_panel",   // "admin_panel" | "mobile_app"
  "syncedAt": "ISODate",           // when the record synced (for offline submissions)
  "createdAt": "ISODate"
}
```

### MalariaContextData Collection (regional backdrop — imported periodically)
```json
{
  "_id": "ObjectId",
  "district": "Nakaseke",
  "year": 2024,
  "source": "malaria_atlas_project",  // "malaria_atlas_project" | "who_gho" | "uganda_moh"
  "incidenceRate": 284.5,             // cases per 1000 population (district level)
  "prevalenceRate": 0.092,            // parasite prevalence (0-1)
  "populationAtRisk": 245000,
  "importedAt": "ISODate",
  "sourceUrl": "https://data.malariaatlas.org/..."
}
```

### Stories Collection
```json
{
  "_id": "ObjectId",
  "title": "Spraying Day at Nakaseke Primary",
  "slug": "spraying-day-nakaseke",
  "content": "Markdown content...",
  "author": "Field Team - Kampala",
  "schoolId": "ObjectId",
  "images": ["url1", "url2"],
  "publishedAt": "ISODate",
  "tags": ["field-update", "nakaseke"]
}
```

---

## 5. Pages & Features — Detailed Breakdown

### Page 1: Landing / Home (`/`)
**Purpose:** Hook visitors, tell the story, drive them to explore or donate.

- Hero section with striking image/video of malaria impact + clear headline
- "How It Works" section — 3-step visual: Donate → We Spray → Kids Stay Healthy
- Interactive scaling timeline: "Year 1: 1 school. Year 2: 2 schools. Year 5: 16 schools." showing how one sponsorship multiplies
- Live stats counter: schools protected, students reached, malaria reduction %
- Featured school spotlight with photo + quick stats
- CTA buttons: "Explore the Map" and "Sponsor a School"
- Testimonial carousel from teachers/students

### Page 2: Interactive Map (`/map`)
**Purpose:** Let donors explore and discover schools to sponsor.

- Full-screen Mapbox GL JS map centered on Uganda (custom branded style via Mapbox Studio)
- Green markers = protected (sprayed within 6mo), Yellow = protection fading (6-12mo), Red = needs sponsor (>12mo or never)
- School status computed live from SprayRecords — always honest, never manually toggled
- Click marker → side panel (desktop) / bottom sheet (mobile) with school summary, photo, stats, "Sponsor This School" CTA
- Filter controls: by district, by burden level, by spray status
- Malaria burden heatmap layer (MAP district-level data) as visual context
- Marker clustering via supercluster when zoomed out, expand on zoom in
- flyTo animation when selecting a school from the list
- Mobile responsive — map fills screen, filters in a slide-out drawer
- Stretch: guided "story tour" — auto-fly between featured schools

### Page 3: School Profiles (`/schools/[id]`)
**Purpose:** Deep dive into a specific school's story and impact.

- Hero photo of the school
- Key stats bar: student count, malaria cases before/after, reduction %
- Before/After photo gallery
- Chart.js chart: malaria cases over time (line chart showing decline after spraying)
- Embedded video from field workers
- Testimonials from teachers, students, parents
- Spraying history timeline
- "Sponsor This School" CTA (prominent)
- Social sharing buttons (Twitter, Facebook, WhatsApp, copy link)

### Page 4: Sponsorship Portal (`/sponsor`)
**Purpose:** Browse schools and begin the sponsorship process.

- Grid/list of schools needing sponsors with photo, name, location, cost
- Filter and sort options
- Click → school profile or straight to checkout
- Clear cost breakdown: "$X sponsors one spraying cycle at [school name]"

### Page 5: Checkout (`/sponsor/checkout`)
**Purpose:** Complete the donation via Stripe.

- Stripe Checkout (hosted or embedded) — handles card, Apple Pay, Google Pay
- One-time or recurring donation toggle
- Donation amount (preset to school's cost, with option to give more)
- Donor info collection (name, email)
- Automatic receipt email
- Redirect to thank-you page with school details and sharing options

### Page 6: Donor Dashboard (`/dashboard`)
**Purpose:** Returning donors see their impact.

- Login required (NextAuth.js)
- List of sponsored schools with current status
- Progress photos and updates from their schools
- Total impact stats: how much donated, how many students protected
- Manage recurring donations (via Stripe customer portal)
- Notification preferences

### Page 7: Stories / Blog (`/stories`)
**Purpose:** Ongoing field updates to keep donors engaged.

- Blog-style list of updates from field teams
- Each post has photos, text, and optionally links to a school profile
- Comments or Q&A section (future consideration)
- Tags for filtering (by school, by district, by topic)

### Page 8: About (`/about`)
**Purpose:** Build trust and explain the model.

- Pilgrim Africa's mission and background
- How the self-funding spraying model works in detail
- Team profiles (optional)
- Partners and supporters
- Contact information

---

## 6. API Endpoints

### Schools
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schools` | List all schools (with filters) |
| GET | `/api/schools/:id` | Get single school with full details |
| POST | `/api/schools` | Create school (admin only) |
| PUT | `/api/schools/:id` | Update school data (admin/field worker) |
| POST | `/api/schools/:id/photos` | Upload photos for a school |

### Spray Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schools/:id/spray-records` | Get spray history for a school |
| POST | `/api/schools/:id/spray-records` | Log a new spray event (admin/field worker) |
| GET | `/api/spray-records/recent` | Get recent spray activity across all schools |
| GET | `/api/stats/map` | Aggregated map data: all schools with computed status |

### Malaria Context
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/malaria-data/districts` | District-level malaria burden (MAP data) |
| GET | `/api/malaria-data/districts/:name` | Single district malaria stats |
| POST | `/api/malaria-data/import` | Admin: import new MAP/WHO data batch |

### Sponsorships
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sponsorships` | Create new sponsorship (triggers Stripe) |
| GET | `/api/sponsorships/:donorId` | Get donor's sponsorships |
| PUT | `/api/sponsorships/:id` | Update sponsorship status |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/checkout` | Create Stripe checkout session |
| POST | `/api/payments/webhook` | Handle Stripe webhook events |
| GET | `/api/payments/portal` | Generate Stripe customer portal link |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories` | List stories (with pagination) |
| GET | `/api/stories/:slug` | Get single story |
| POST | `/api/stories` | Create story (admin/field worker) |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register donor account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

---

## 7. Build Phases

### Phase 1: Foundation + Landing + Map (Weeks 1-3)
**Goal:** A working site people can visit, explore, and understand the mission.

- [ ] Set up monorepo (Next.js + Express + shared packages)
- [ ] Configure Tailwind, TypeScript, ESLint
- [ ] Set up MongoDB Atlas + connection from Express
- [ ] Build root layout (nav, footer) with branding
- [ ] Build landing page (hero, how-it-works, stats, CTA)
- [ ] Seed database with 10+ sample schools (names, coordinates, mock data)
- [ ] Build interactive map page with Mapbox GL JS + react-map-gl
- [ ] Design custom Mapbox Studio style (branded for Pilgrim Protect)
- [ ] School markers with computed color coding (green/yellow/red from SprayRecords)
- [ ] Click → side panel (desktop) / bottom sheet (mobile) with school details
- [ ] Filter controls (district, burden level, spray status)
- [ ] Marker clustering via supercluster
- [ ] flyTo animations for school selection
- [ ] Mobile responsive map layout
- [ ] Import Uganda district boundary GeoJSON
- [ ] Malaria burden heatmap layer (MAP data)
- [ ] Deploy dev environment on MacBook + Tailscale

### Phase 2: School Profiles + Media (Weeks 3-4)
**Goal:** Individual school pages with rich content.

- [ ] Build school profile page template
- [ ] Photo gallery component (before/after)
- [ ] Chart.js integration — malaria case reduction charts
- [ ] Video embed component (YouTube/Vimeo)
- [ ] Testimonial display component
- [ ] Social sharing buttons
- [ ] School listing/browse page
- [ ] Set up Cloudinary for image uploads
- [ ] Connect school profiles to map popups ("View Full Profile" link)

### Phase 3: Donor Tools + Payments (Weeks 5-6)
**Goal:** Donors can sign up, browse, and sponsor schools.

- [ ] Set up Stripe account (apply for nonprofit rate)
- [ ] Implement NextAuth.js for donor registration/login
- [ ] Build sponsorship portal (browse schools needing sponsors)
- [ ] Build Stripe checkout flow (one-time + recurring)
- [ ] Webhook handler for payment confirmation
- [ ] Automatic receipt/thank-you emails
- [ ] Donor dashboard (my sponsorships, impact stats)
- [ ] Stripe customer portal for managing recurring donations
- [ ] Update school status when sponsored

### Phase 4: Stories + Polish + Launch (Weeks 7-8)
**Goal:** Content pipeline, testing, and go-live.

- [ ] Build stories/blog section
- [ ] Set up email campaign integration (Brevo)
- [ ] Automated email series: welcome → progress update → renewal reminder
- [ ] Accessibility pass: alt text, keyboard nav, screen reader testing
- [ ] Performance optimization: image lazy loading, code splitting
- [ ] SEO: meta tags, Open Graph, sitemap, structured data
- [ ] Cross-browser and mobile testing
- [ ] Security review: HTTPS, input validation, rate limiting
- [ ] Deploy to Vercel + Railway
- [ ] Point pilgrimprotectstory.org DNS to Vercel
- [ ] User testing with sample donors

### Phase 5 (Future): Mobile App for Field Workers
- Expo (React Native) app — the "spray check-in" tool
- Worker arrives at school → GPS auto-confirms location matches school record
- Log spray event: buildings covered, insecticide used, team members, notes
- Camera integration for before/during/after photos
- Offline-first: queue submissions locally, sync when connectivity returns (critical for rural Uganda)
- View assigned schools on a map, see which ones still need spraying this cycle
- Push notifications for new spray campaign assignments
- Same backend API (`/api/schools/:id/spray-records`) — no duplication
- Admin dashboard shows real-time field activity as workers submit records

---

## 8. Multilingual Support

The project PDF mentions English + local Ugandan languages. Plan:

- Use `next-intl` or Next.js built-in i18n routing
- Start with English only
- Structure all user-facing text as translation keys from day one
- Add Luganda (most widely spoken) as the first additional language
- This makes adding more languages later trivial

---

## 9. Data Sources & Architecture

### Three-Layer Data Model

**Layer 1: Pilgrim Africa Operational Data (PRIMARY — live)**
This is the heartbeat of the platform. All school records and spraying activity comes directly from Pilgrim Africa's own work on the ground.

| Data | Source | Update Frequency | How |
|------|--------|-------------------|-----|
| School master records | Pilgrim Africa team | Rarely (new school added) | Admin panel or bulk import |
| School GPS coordinates | Pilgrim Africa + field workers | Once per school | GPS from mobile app or manual entry |
| Spray records | Field workers via mobile app (Phase 2), admin panel (Phase 1) | Per spray event (daily during campaigns) | Worker checks in at school, logs what was sprayed |
| Before/after malaria stats | Pilgrim Africa field data | Per spray cycle | Worker or admin inputs case counts |
| Photos & videos | Pilgrim Africa field teams | Per visit | Uploaded via admin tools or mobile app |
| School status (computed) | Derived from spray records | Real-time | API computes: last spray < 6mo = green, 6-12mo = yellow, >12mo or never = red |

**Layer 2: Regional Malaria Context Data (backdrop — periodic)**
Gives visitors the "why this matters" context. Not Pilgrim Africa's data — it's the bigger picture.

| Data | Source | Update Frequency | How |
|------|--------|-------------------|-----|
| District-level malaria burden | Malaria Atlas Project (MAP) | Annual | Download from data.malariaatlas.org, import to MongoDB |
| National malaria statistics | Uganda MoH weekly reports / DHIS2 | Quarterly refresh | Manual import or scrape from library.health.go.ug |
| WHO country-level stats | WHO GHO API | Annual | API call, cached 30 days |

**Why not "live" external data?** WHO publishes annual country-level numbers. Uganda's DHIS2 has weekly district data but requires a data-sharing agreement with the Ministry of Health (Pilgrim Africa may already have this via their MoH partnership). The Malaria Atlas Project (MAP) provides the best freely available district-level modeled data. For launch, we import MAP data as our context layer and display "Last updated: [date]" transparently.

**Future opportunity:** If Pilgrim Africa's MoH partnership grants DHIS2 API access, we can pull weekly district malaria case counts directly — making the context layer near-real-time.

**Layer 3: Geographic Reference Data (static)**

| Data | Source | Update Frequency | How |
|------|--------|-------------------|-----|
| Uganda district boundaries | Natural Earth / GADM / Uganda Bureau of Statistics | Never (unless redistricting) | Static GeoJSON file in the project |
| Map tiles + styling | Mapbox Studio (custom branded style) | Design once, tweak as needed | Mapbox Studio visual editor |

### Caching Strategy
| Layer | Cache Duration | Reason |
|-------|---------------|--------|
| School data | 5 minutes or no cache | Changes with field worker input |
| Spray records | No cache | Must be current |
| Malaria context (MAP/WHO) | 24 hours — 30 days | Annual data, no urgency |
| District boundaries GeoJSON | 30 days (or indefinite via CDN) | Effectively static |
| Mapbox tiles | Handled by Mapbox CDN | Automatic |

### School Data Workflow

**Baseline (one-time setup):** Pre-load all target schools into MongoDB — school name, GPS coordinates, district, sub-county, student enrollment, building count, contact person. Source: Pilgrim Africa's existing school lists. This is the "where" and "who."

**Dynamic layer (ongoing):** Field workers update what they covered. Each spray event creates a new SprayRecord — which school, date, buildings sprayed, insecticide used, team members, photos, notes. The school's map status is *computed* from the latest spray record, never manually toggled. This means the map is always honest — if nobody sprayed a school, it stays red.

**Phase 1 (no mobile app yet):** Admin panel in the web app for entering spray records manually. Pilgrim Africa staff enter data after each campaign.

**Phase 2 (mobile app):** Field workers carry phones, arrive at a school, GPS auto-confirms location, they log the spray event, snap photos, and submit. Offline queue for areas with poor connectivity — syncs when back online.

---

## 10. Cost Summary

| Item | Monthly Cost |
|------|-------------|
| Vercel (frontend) | $0 (free tier) |
| Railway (backend) | ~$5-7 |
| MongoDB Atlas | $0 (free tier, 512MB) |
| Cloudinary | $0 (free tier, 25GB) |
| Stripe | 2.2% + $0.30 per donation |
| Domain (pilgrimprotectstory.org) | ~$12/year |
| Apple Developer (if/when mobile app) | $0-99/year |
| Google Play (if/when mobile app) | $25 one-time |
| **Total** | **~$5-7/month + domain** |

---

## 11. What's Out of Scope (per project brief)

- Full e-commerce / shop functionality
- Advanced AI analytics
- Physical hardware
- Native desktop app
- Multi-country expansion (build for Uganda first, architecture supports adding countries later)

---

## 12. Key Decisions to Make Together

Before we start coding, we should align on:

1. **Branding** — You mentioned you have assets. I'll need: logo, primary/accent colors, fonts, any brand guidelines
2. **Sample school data** — Do you have real school names/locations from Pilgrim Africa, or should we start with realistic mock data?
3. **Stripe account** — Has Pilgrim Africa registered as a nonprofit with Stripe, or do we need to do that?
4. **Content** — Who writes the story copy for the landing page and "How It Works" section?
5. **Admin access** — Do we need a separate admin panel for managing schools/stories, or is direct database management okay for now?
