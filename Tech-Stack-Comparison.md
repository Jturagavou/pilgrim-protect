# Pilgrim Protect Story — Tech Stack Comparison
## Every Decision, Compared Side by Side

---

## 1. Frontend Framework

The PDF suggests: *"React.js for the frontend"* with *"Bootstrap or Tailwind CSS"*

| | **Next.js 15** | **Astro** | **Remix** | **Nuxt (Vue)** |
|---|---|---|---|---|
| **Language** | React / TypeScript | Any (React, Vue, Svelte) | React / TypeScript | Vue / TypeScript |
| **SSR / SEO** | Excellent — SSR + SSG + ISR | Best — ships near-zero JS, 100 Lighthouse scores | Excellent — progressive enhancement | Good — SSR + SSG |
| **Interactive map support** | Great — react-leaflet is mature | Needs "client islands" for interactive parts | Good — works with react-leaflet | Would need vue-leaflet (smaller ecosystem) |
| **Stripe/payment integration** | Excellent — huge ecosystem | Limited — mainly static sites | Good | Good |
| **Mobile app code sharing** | High — shared React logic with Expo | None — different paradigm | Moderate | None — Vue vs React |
| **Community / hiring** | Largest React ecosystem | Growing fast, but smaller | Smaller | Large in Vue world |
| **Learning curve** | Moderate (App Router is complex) | Low for static, moderate for dynamic | Moderate | Moderate |
| **Free hosting** | Vercel free tier (optimized for it) | Vercel, Netlify, Cloudflare | Vercel, Netlify, Fly.io | Vercel, Netlify |
| **Best for** | Full-stack apps with dynamic + static pages | Content-heavy sites with minimal interactivity | Forms-heavy apps, progressive enhancement | Vue-based teams |

### Verdict
**Next.js 15** remains the right pick. The interactive map, Stripe checkout, donor dashboard, and future code-sharing with the Expo mobile app all demand a full React framework. Astro would be faster for a purely content site, but we need too much interactivity. The PDF's suggestion of React aligns perfectly.

**What changes from the PDF:** We use Next.js (React framework) instead of plain React — gives us SSR for SEO, API routes, and better deployment. We use Tailwind CSS (the PDF listed it as an option alongside Bootstrap). Tailwind is the modern standard and pairs better with Next.js.

---

## 2. Interactive Map

The PDF suggests: *"Leaflet or Google Maps API"*

| | **Leaflet** | **MapLibre GL JS** | **Mapbox GL JS** | **Google Maps** |
|---|---|---|---|---|
| **Cost** | $0 forever | $0 forever (open source) | Free up to 50K loads/mo, then $5/1K loads | $200/mo free credit, then $7/1K loads |
| **API key required** | No (with OpenStreetMap tiles) | No (with free tile sources) | Yes | Yes |
| **Rendering** | Raster (DOM-based) | Vector (WebGL) | Vector (WebGL) | Vector |
| **Performance (1000+ markers)** | Good with clustering plugin | Excellent — handles 10K+ markers natively | Excellent | Good |
| **Customization** | Huge plugin ecosystem (marker clusters, popups, filters) | Growing, fewer plugins | Best — Mapbox Studio for custom styles | Limited without paid features |
| **React wrapper** | react-leaflet (mature, well-documented) | react-map-gl (shared with Mapbox) | react-map-gl | @vis.gl/react-google-maps |
| **Offline/low bandwidth** | Good — raster tiles cache well | Needs WebGL support | Needs WebGL support | Requires internet |
| **3D / terrain** | No | Yes | Yes | Limited |
| **Weekly npm downloads** | ~2.5M | ~500K | ~600K | N/A |
| **Best for** | Simple marker maps, broad browser support | Modern vector maps at zero cost | Premium custom-styled maps | Street View, directions, places |

### Verdict
**Leaflet** is the pragmatic choice for this project. We're plotting ~10-50 school markers on a map of Uganda with popups and filters — not building a 3D globe. Leaflet is free, needs no API key, has the most tutorials/examples, and the react-leaflet + marker-cluster combo is battle-tested.

**Why not MapLibre?** It's technically superior (vector tiles, WebGL) and also free. But it's heavier, has fewer React examples, and the WebGL requirement could be a problem for users in Uganda on older devices or low-end phones. If we ever need vector maps or 3D, we can upgrade later.

**Why not Google Maps?** Costs money at scale, requires billing account setup, and the free $200/month credit could run out if the site gets traffic from a viral campaign.

**What changes from the PDF:** Nothing — the PDF suggested Leaflet first, and that's what we're going with.

---

## 3. Database

The PDF suggests: *"MongoDB or Firebase for data storage"*

| | **Supabase** | **MongoDB Atlas** | **Firebase Firestore** | **PlanetScale** |
|---|---|---|---|---|
| **Type** | PostgreSQL (relational) | Document (NoSQL) | Document (NoSQL) | MySQL (relational) |
| **Free tier** | 500MB, 50K MAUs, 500MB bandwidth | 512MB, shared cluster | 1GB stored, 50K reads/day | No free tier (removed 2024) |
| **Paid pricing** | $25/mo (8GB, 250K MAUs) | $57/mo (10GB, dedicated) | Pay-as-you-go (complex pricing) | $39/mo |
| **Built-in auth** | Yes (50K MAU free) | No (need separate service) | Yes (generous free tier) | No |
| **Built-in storage** | Yes (1GB free) | No | Yes (5GB free) | No |
| **Real-time** | Yes (subscriptions) | Yes (change streams) | Yes (native) | No |
| **Edge functions** | Yes (Deno-based) | No (need separate backend) | Yes (Cloud Functions) | No |
| **REST API** | Auto-generated from schema | Need to build Express API | Auto-generated | No |
| **Self-hostable** | Yes (open source) | No (Atlas is cloud-only) | No | No |
| **Querying** | SQL (powerful joins, aggregations) | MongoDB query language | Limited querying, no joins | SQL |
| **Data modeling fit** | Good — relational model works for schools ↔ donors ↔ sponsorships | Good — flexible docs for varied school data | Okay — nested docs work but querying is limited | Good but no free tier |
| **Vendor lock-in** | Low (it's just Postgres) | Medium | High (Firebase-specific SDK) | Medium |

### Verdict
**This is where I'd challenge the PDF's suggestion.** The PDF says MongoDB or Firebase, but **Supabase** is a stronger choice for this project in 2026 for several reasons:

1. **Auth is included free** — 50K MAU on the free tier means we don't need a separate auth service for donors. MongoDB needs a separate solution (NextAuth, Clerk, etc.)
2. **Storage is included** — 1GB free for school photos, vs needing to set up Cloudinary separately with MongoDB
3. **Auto-generated REST API** — we might not even need Express for many endpoints. Supabase generates a REST API from your database schema automatically
4. **Relational model fits better** — schools, donors, sponsorships, and stories have clear relationships. SQL joins are simpler than MongoDB aggregation pipelines for queries like "show me all sponsors of schools in Nakaseke district"
5. **Row-level security** — donors can only see their own data, field workers can only update their assigned schools. Built into the database, not bolted on
6. **Real-time subscriptions** — when a school gets sponsored, the map can update live without polling
7. **It's just Postgres** — zero vendor lock-in. If Supabase disappears tomorrow, you take your SQL database anywhere

**If we go with Supabase, we could potentially simplify the architecture significantly:**
- Drop the separate Express backend (Supabase handles auth, storage, API)
- Use Next.js API routes + Supabase client for everything
- Still add Express later for the mobile app if needed, or just call Supabase directly from Expo

**The trade-off:** MongoDB's flexible schema is nice during early development when you're not sure what school data looks like yet. With Postgres/Supabase, you define your schema upfront. But for a project with well-defined entities (schools, donors, sponsorships), this is actually a benefit — it catches data issues early.

**If we stick with MongoDB** (honoring the PDF's suggestion): MongoDB Atlas free tier (512MB) + NextAuth.js for auth + Cloudinary for images. This works, it's just more pieces to manage.

---

## 4. Payments / Donations

The PDF suggests: *"Stripe or PayPal"*

| | **Stripe** | **Zeffy** | **Donorbox** | **PayPal** |
|---|---|---|---|---|
| **Platform fee** | None | None ($0) | 2.95% (Standard) or 1.6% (Premium at $139/mo) | None |
| **Transaction fee** | 2.2% + $0.30 (nonprofit) | 0% — completely free | Stripe: 2.7%+$0.05 or PayPal: 1.75% (on top of platform fee) | 1.99% + $0.49 (nonprofit) |
| **Total cost on $500 donation** | $11.30 | $0 | $14.75 (Standard) + Stripe fees | $10.44 |
| **Recurring donations** | Yes (Stripe Billing) | Yes | Yes | Yes (PayPal Subscriptions) |
| **Embeddable checkout** | Yes — Stripe Checkout, Elements | Embeddable donation forms | Embeddable forms | PayPal Buttons |
| **Custom integration** | Full API control — build exactly what you want | Limited — use their forms | Moderate — customize their forms | Moderate API |
| **Donor management** | Basic (need to build dashboard) | Built-in CRM, tax receipts | Built-in donor management | Basic |
| **Tax receipts** | Need to build | Automatic | Automatic | Need to build |
| **How they make money** | Transaction fees | Optional donor tips (15-17% default suggestion) | Platform fee + processing fees | Transaction fees |
| **Developer experience** | Best — excellent docs, webhooks, testing tools | Limited — no real API | Good SDKs | Dated, complex |
| **App store concern** | None | None | None | None |

### Verdict
This is a real trade-off with no single winner:

**Stripe** gives us full control. We can build a custom sponsorship flow that feels native to the site — donor picks a school on the map, clicks sponsor, sees the cost, checks out. The 2.2% + $0.30 nonprofit rate is reasonable, and the developer experience is unmatched. But we have to build the donor dashboard, tax receipts, and email notifications ourselves.

**Zeffy** is genuinely free — $0 to the nonprofit. They make money by suggesting donors add a tip to Zeffy (default 15-17%, but donors can set it to $0). Over 100K nonprofits use it, rated 4.9/5. The catch: limited API, so we can't build a fully custom checkout experience. We'd embed their donation forms rather than building our own.

**My recommendation: Start with Stripe** for the custom experience the project demands (the interactive map → school → sponsor → checkout flow is core to the platform). But **add Zeffy as an alternative donation option** — a "Donate via Zeffy" button alongside the Stripe checkout. This gives donors a choice and means more money reaches the schools.

**Why not PayPal?** Lower fees than Stripe, but the developer experience is significantly worse, and the checkout flow feels dated. The PDF lists it as an option, but Stripe is better in every way except per-transaction cost.

---

## 5. Content Management (for Stories/Blog)

The PDF suggests: *"Blog-style updates from field teams"*

| | **MDX files in repo** | **Payload CMS** | **Strapi** | **Sanity** |
|---|---|---|---|---|
| **Cost** | $0 | $0 (self-hosted) or $35/mo (cloud) | $0 (self-hosted) or $75/mo (cloud) | $0 (free tier: 100K API req/mo) |
| **Who can publish** | Developers only (edit code, push to Git) | Anyone via admin panel | Anyone via admin panel | Anyone via admin panel (Sanity Studio) |
| **Setup complexity** | Trivial — just markdown files | Moderate — embeds in Next.js | Moderate — separate server | Low — hosted service |
| **Image handling** | Manual (Cloudinary URLs in markdown) | Built-in media library | Built-in media library | Built-in asset pipeline |
| **Field worker usability** | Low — needs GitHub access | High — visual editor | High — visual editor | High — visual editor |
| **Multilingual** | Manual (duplicate files) | Built-in i18n | Built-in i18n | Built-in |
| **Scalability** | Limited by Git repo size | Excellent | Excellent | Excellent |
| **Self-hostable** | N/A (it's just files) | Yes (open source) | Yes (open source) | No (but generous free tier) |

### Verdict
**Phase 1: MDX files in the repo.** Zero setup cost, no additional infrastructure. Good enough while we're building the core platform and have <20 blog posts.

**Phase 2: Payload CMS** when field workers need to publish updates without developer help. Payload is TypeScript-native, embeds directly inside our Next.js app (same server), and is fully open source. It's the most natural fit. Self-hosted = $0, or $35/mo for their cloud if we want managed hosting.

**Why not Sanity?** It's excellent but hosted — the free tier has API request limits that could become a problem. Payload gives us more control and no usage caps when self-hosted.

---

## 6. Image & Media Hosting

The PDF suggests: *"AWS S3 or similar for image/video hosting"*

| | **Cloudinary** | **Supabase Storage** | **Uploadcare** | **AWS S3 + CloudFront** |
|---|---|---|---|---|
| **Free tier** | 25 credits (≈25GB storage + 25GB bandwidth) | 1GB storage (with Supabase) | 3,000 uploads/mo | 5GB for 12 months, then pay |
| **Paid pricing** | $89/mo (Plus) | Included in Supabase $25/mo plan | $20/mo | ~$0.023/GB stored + $0.085/GB transferred |
| **Auto image optimization** | Yes — resize, crop, format on-the-fly | No — basic file storage | Yes — CDN + transformations | No (need Lambda or separate service) |
| **CDN** | Yes (global) | Yes (via Supabase CDN) | Yes | CloudFront ($0.085/GB) |
| **Upload widget** | Yes (drop-in) | Basic | Yes (polished) | No (build your own) |
| **Video support** | Yes (transformation + streaming) | Basic file hosting | Limited | S3 + CloudFront streaming |
| **Developer experience** | Excellent — URL-based transforms | Simple — works like any storage | Good | Complex — many AWS services to configure |

### Verdict
**If we use Supabase:** Use **Supabase Storage** for everything. It's included, simple, and 1GB free is enough to start. No additional service to manage.

**If we use MongoDB:** Use **Cloudinary** free tier. The auto-optimization (serve WebP, resize for mobile, lazy loading URLs) saves bandwidth — important for users in Uganda on slower connections. 25 credits is generous for a nonprofit site's photo volume.

**Why not S3?** The PDF suggests it, but S3 alone doesn't optimize images. You'd need S3 + CloudFront + Lambda for image processing — way more complexity for a small team. Cloudinary or Supabase Storage handles all of that in one service.

Videos should be YouTube/Vimeo embeds regardless — the PDF already suggests this and it's the right call. No hosting cost, global CDN, and mobile-optimized players for free.

---

## 7. Email / Notifications

The PDF suggests: *"Mailchimp for email notifications"* and *"automated email campaign series"*

| | **Resend** | **Brevo (ex-Sendinblue)** | **Mailchimp** | **SendGrid** |
|---|---|---|---|---|
| **Free tier** | 100 emails/day, 3,000/month | 300 emails/day (9,000/month) | No free tier for transactional (paid add-on) | 100 emails/day for 60 days only |
| **Paid pricing** | $20/mo (50K emails) | $9/mo (5K emails) or $18/mo (20K emails) | $13/mo (500 contacts) + Mandrill add-on | $19.95/mo (50K emails) |
| **Transactional emails** | Yes (primary purpose) | Yes | Via Mandrill add-on only | Yes |
| **Marketing campaigns** | No (transactional only) | Yes (email + SMS + CRM) | Yes (strongest marketing features) | Yes |
| **Developer experience** | Excellent — modern API, React Email templates | Good | Dated API | Good but complex |
| **React Email support** | Yes (built by same team) | No | No | No |
| **Nonprofit discount** | Not listed | Not listed | Yes (15% discount) | Not listed |
| **Automation flows** | Basic (via API) | Yes (visual builder) | Yes (visual builder) | Yes (via API) |
| **Best for** | Transactional emails (receipts, welcome) | All-in-one: transactional + marketing + CRM | Marketing campaigns + newsletters | High-volume transactional |

### Verdict
We need two types of email: transactional (donation receipts, welcome emails, password resets) and marketing (progress updates, renewal reminders, newsletters).

**Option A — Two services:** **Resend** for transactional ($0, excellent DX, React Email templates that match our site) + **Brevo** for marketing campaigns ($0-9/mo, visual automation builder). Total: $0-9/mo.

**Option B — One service:** **Brevo** for everything. 300 emails/day free handles both transactional and marketing for a small nonprofit. The automation builder lets non-technical team members create email campaigns. Total: $0.

**My recommendation: Start with Brevo for everything.** Simplest setup, generous free tier, handles both transactional and marketing. If email volume grows or we want fancier developer templates, add Resend for transactional later.

**Why not Mailchimp?** The PDF suggests it, but Mailchimp's transactional email (Mandrill) is a paid add-on and their pricing has gotten expensive. Brevo gives you more for less.

---

## 8. Authentication

The PDF suggests: *"Authentication for donor accounts"*

| | **Supabase Auth** | **NextAuth (Auth.js)** | **Clerk** | **Auth0** |
|---|---|---|---|---|
| **Cost** | $0 (50K MAU free) | $0 (open source) | $0 (10K MAU free), then $0.02/MAU | $0 (7.5K MAU), then $0.07/MAU |
| **Pre-built UI** | Yes (basic) | No (build your own) | Yes (polished, customizable) | Yes (Universal Login) |
| **Social logins** | Google, GitHub, Facebook, etc. | Google, GitHub, Facebook, etc. | Google, Apple, Facebook, etc. | Everything |
| **Email/password** | Yes | Yes | Yes | Yes |
| **Magic links** | Yes | Yes (with email provider) | Yes | Yes |
| **Requires separate DB** | No (included with Supabase) | Yes (your database) | No (managed) | No (managed) |
| **Self-hostable** | Yes | Yes | No | No |
| **Setup time** | Minutes (if using Supabase DB) | 30-60 min | Minutes | 15-30 min |
| **Donor management** | Basic (user metadata) | None (just auth) | Yes (user profiles, organizations) | Yes (user management) |

### Verdict
**If we use Supabase:** Use **Supabase Auth**. It's included, 50K MAU free, and tightly integrated with the database (row-level security based on auth). No additional service needed.

**If we use MongoDB:** Use **NextAuth.js (Auth.js)**. Free, open source, works with MongoDB adapter. We build the login UI ourselves, but it integrates naturally with Next.js App Router.

**The premium option:** **Clerk** ($0 for 10K MAU) gives us beautiful pre-built auth components and a user management dashboard. Saves development time but adds a dependency and costs money as you scale.

---

## 9. Hosting

The PDF suggests: No specific hosting mentioned, but *"deployed demo site"* as a deliverable.

| | **Vercel** | **Netlify** | **Railway** | **Render** |
|---|---|---|---|---|
| **Frontend hosting** | Excellent (Next.js optimized) | Good | Good | Good |
| **Backend hosting** | Serverless functions only | Serverless functions only | Full servers, workers, cron | Full servers, workers, cron |
| **Database hosting** | Vercel Postgres ($20/mo) | No | Yes (Postgres, Redis, MongoDB) | Yes (Postgres) |
| **Free tier** | 100GB bandwidth, 100 hrs serverless | 100GB bandwidth, 125K function calls | Trial credits | 750 hrs free/mo |
| **Paid pricing** | $20/user/mo (Pro) | $19/user/mo (Pro) | ~$5-7/mo (Hobby usage-based) | $7/mo per web service |
| **Custom domains** | Yes (free) | Yes (free) | Yes (free) | Yes (free) |
| **Auto deploy from Git** | Yes | Yes | Yes | Yes |
| **Preview deployments** | Yes (every PR) | Yes (every PR) | No | No |
| **DX (developer experience)** | Best for Next.js | Good | Excellent — visual service canvas | Good |

### Verdict

**If we use Supabase (recommended):** We only need frontend hosting since Supabase handles the backend. **Vercel free tier** is all we need — $0/month. Supabase free tier for DB + auth + storage. **Total: $0/month for development, ~$25/month for production** (Supabase Pro).

**If we use MongoDB + Express:** **Vercel** (frontend) + **Railway** (backend) — ~$5-7/month. This is what we originally planned.

---

## 10. UI Component Library

Not mentioned in the PDF, but critical for development speed.

| | **shadcn/ui** | **Chakra UI** | **Radix + Tailwind** | **Material UI** |
|---|---|---|---|---|
| **Cost** | $0 (copy-paste, you own it) | $0 (npm package) | $0 (npm package) | $0 (npm package) |
| **Styling** | Tailwind CSS | Emotion (CSS-in-JS) | Tailwind CSS | Emotion / styled |
| **Customizable** | Fully — you own the source code | Moderate — theme tokens | Fully — primitives you style | Moderate — theme system |
| **Bundle size** | Minimal (only what you use) | Larger (runtime CSS) | Minimal | Larger |
| **Accessibility** | Built on Radix (excellent) | Good | Excellent (headless) | Good |
| **Looks professional** | Modern, clean | Clean | You design it | Google Material look |
| **Best for** | Tailwind projects (exactly us) | Quick prototyping | Full design control | Google-style UIs |

### Verdict
**shadcn/ui** — no contest for our stack. It's built on Tailwind (which we're using), the components are beautiful and accessible, and we own the code (not a dependency that could break on update). Copy in what we need, customize to match Pilgrim Protect branding.

---

## Summary: Recommended Stack vs PDF Suggestions

| Decision | PDF Suggests | Our Recommendation | Why the change (if any) |
|----------|-------------|-------------------|----------------------|
| **Frontend** | React + Bootstrap/Tailwind | **Next.js 15 + Tailwind** | Next.js adds SSR/SEO. Tailwind > Bootstrap in 2026 |
| **Backend** | Node.js + Express | **Option A: Supabase (simpler)** or **Option B: Express (as PDF suggests)** | Supabase eliminates need for separate auth, storage, API |
| **Database** | MongoDB or Firebase | **Option A: Supabase (Postgres)** or **Option B: MongoDB Atlas** | Supabase bundles auth+storage+API. Relational model fits better |
| **Map** | Leaflet or Google Maps | **Leaflet (react-leaflet)** | Agrees with PDF. Free, no API key, lighter |
| **Charts** | Chart.js | **Chart.js (react-chartjs-2)** | No change — PDF got this right |
| **Payments** | Stripe or PayPal | **Stripe** (+ optional Zeffy link) | Stripe at nonprofit rate. Zeffy as fee-free alternative |
| **Images** | AWS S3 | **Supabase Storage** or **Cloudinary** | Auto-optimization, simpler than S3+CloudFront |
| **Video** | YouTube/Vimeo embeds | **YouTube/Vimeo embeds** | No change — PDF got this right |
| **Email** | Mailchimp | **Brevo** | More generous free tier, better transactional support |
| **Auth** | Custom (mentioned "authentication") | **Supabase Auth** or **NextAuth.js** | Depends on database choice |
| **CMS** | Not specified | **MDX → Payload CMS** | Start simple, add visual CMS when field workers need it |
| **UI components** | Not specified | **shadcn/ui** | Saves weeks of UI development |
| **Hosting** | Not specified | **Vercel + Supabase** or **Vercel + Railway** | $0-7/month depending on path |

---

## The Big Decision: Two Architecture Paths

### Path A: Supabase-Powered (Simpler)
```
Next.js 15 ──→ Supabase (Postgres + Auth + Storage + Real-time API)
     ↓
  Vercel (hosting)

Monthly cost: $0 (dev) → $25 (production)
Pieces to manage: 2 (Vercel + Supabase)
Backend code needed: Minimal (Next.js API routes + Supabase client)
```

**Pros:** Fewer moving parts, auth/storage/API included, faster to build, real-time updates built in, row-level security.

**Cons:** Less custom backend control, vendor dependency on Supabase (mitigated: it's open source Postgres), mobile app would call Supabase directly (fine, but different from a custom API).

### Path B: Express-Powered (PDF's architecture)
```
Next.js 15 ──→ Express API ──→ MongoDB Atlas
     ↓              ↓
  Vercel         Railway
                    + NextAuth.js (auth)
                    + Cloudinary (images)
                    + Brevo (email)

Monthly cost: $5-7 (dev) → $30-40 (production)
Pieces to manage: 5-6 (Vercel + Railway + MongoDB + Cloudinary + Brevo + NextAuth)
Backend code needed: Full Express API with routes, models, middleware
```

**Pros:** Full control over every piece, custom API shared with mobile app, matches the PDF's suggested architecture exactly, more traditional and transferable skills for interns.

**Cons:** More infrastructure to manage, more code to write and maintain, more potential points of failure, higher monthly cost.

### My Honest Take

**Path A (Supabase) gets the site live faster** and costs less. For a nonprofit that needs to start showing impact to donors, speed matters. The architecture is modern, the DX is excellent, and you can always add a custom API layer later if the mobile app needs it.

**Path B (Express) is what the PDF was designed around** and is a more traditional full-stack architecture. If part of the project's goal is to teach interns standard backend development patterns (Express, REST APIs, MongoDB), this path is more educational.

Both paths use the same frontend (Next.js + Tailwind + shadcn/ui + Leaflet + Chart.js + Stripe). The difference is only in how the backend is handled.
