# Pilgrim Protect — Donor Website

The donor-facing website for Pilgrim Protect, a malaria prevention platform for Uganda. Built with Next.js 16, Tailwind CSS, shadcn/ui, Mapbox GL JS, and Chart.js.

**Full stack on your Mac (API + Mongo + env):** see **[../LOCAL-DEV.md](../LOCAL-DEV.md)** in the repo root.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Run in development mode — set NEXT_PUBLIC_MOCK=true in .env.local for UI-only (no API)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL access token | (required for map) |
| `NEXT_PUBLIC_MOCK` | Enable mock data mode | `true` |

## Mock Mode

When `NEXT_PUBLIC_MOCK=true`, the site uses hardcoded mock data (10 Uganda schools) instead of calling the backend API. This allows the frontend to work standalone during development.

To connect to the real backend, set `NEXT_PUBLIC_MOCK=false` and ensure the backend is running on port 8080.

## Pages

- `/` — Homepage with hero, impact counters, mini map preview
- `/map` — Full interactive Mapbox map with sidebar school list and filters
- `/schools/[id]` — Individual school profile with photos, spray timeline, mini map
- `/dashboard` — Impact statistics with Chart.js line and bar charts
- `/donate` — Donation page with school selection, impact guidance, and external giving CTA
- `/donate/success` — Post-donation thank you page
- `/stories` — Field worker stories (hardcoded for prototype)
- `/about` — Mission, how spraying works, the team
- `/auth/login` — Donor login
- `/auth/register` — Donor registration
- `/portal` — Donor portal with donation history and impact stats

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Map:** Mapbox GL JS via react-map-gl
- **Charts:** Chart.js via react-chartjs-2
- **HTTP:** Axios
- **Backend:** Connects to Express API on port 8080

## Project Structure

```
web/
├── app/
│   ├── layout.js          # Root layout with Navbar + Footer
│   ├── page.js            # Homepage
│   ├── map/page.js        # Interactive map
│   ├── schools/[id]/page.js  # School profile
│   ├── dashboard/page.js  # Impact dashboard
│   ├── donate/page.js     # Donation page
│   ├── donate/success/page.js
│   ├── stories/page.js    # Field stories
│   ├── about/page.js      # About page
│   ├── auth/login/page.js
│   ├── auth/register/page.js
│   └── portal/page.js     # Donor portal
├── components/
│   ├── Navbar.js
│   ├── Footer.js
│   ├── MapView.js         # Mapbox map component
│   ├── SchoolMarker.js
│   ├── SchoolCard.js
│   ├── ImpactCounter.js   # Animated stat counter
│   ├── SprayTimeline.js
│   ├── DonateButton.js
│   └── PhotoGallery.js
├── lib/
│   ├── api.js             # Axios instance + all API calls
│   ├── auth.js            # Token storage helpers
│   ├── formatters.js      # Date/number formatting
│   └── mockData.js        # Mock data for standalone mode
└── public/images/
```

## Deployment

This app is deployed with the repo root DigitalOcean App Platform spec in
[`../.do/app.yaml`](../.do/app.yaml), not Vercel.

Typical production rules:

- `NEXT_PUBLIC_MOCK=false`
- `NEXT_PUBLIC_API_URL` must end with `/api/v1`
- `NEXT_PUBLIC_API_URL` must be available at build time and runtime
- `NEXT_PUBLIC_MAPBOX_TOKEN` must be available at build time and runtime

The app also exposes `GET /api/public/runtime-config` so the browser can
recover the live API base URL and Mapbox token if a deploy baked incorrect
`NEXT_PUBLIC_*` values into the bundle.

See [../DEPLOYMENT.md](../DEPLOYMENT.md) and [../SMOKE_TESTS.md](../SMOKE_TESTS.md)
for the full deploy and verification flow.
