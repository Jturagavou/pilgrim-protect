# Pilgrim Protect — v1 pilot scope (locked) vs planning docs

This file is the **source of truth in-repo** for what “v1 pilot” shipped. The planning pack in the **Pilgrem Team Project OM** repo (`planning/ROADMAP.md`, `MASTER-BUILD-PLAN.md`, `COMPONENT-PICKS.md`) remains the strategic narrative; the OM roadmap table is updated to match this status.

## v1 pilot scope (locked decisions)

| Decision | Choice |
|----------|--------|
| **In-app card payments** | **Out for v1.** Donors use Pilgrim Africa’s main giving channels (`/donate` links externally + mailto). API `POST /donations/checkout` returns **410**. |
| **21st.dev / shadcn blocks** | **Reference-only for v1** unless explicitly installed later. UI follows **bones/skin** from OM `COMPONENT-PICKS.md`: composition and motion patterns, Pilgrim tokens and copy — not stock SaaS chrome. |
| **Mobile** | **Field-worker MVP** in Expo: login, school list, spray report with photos/GPS, offline queue + sync. Richer architecture (SQLite delta sync, admin-in-app, moderation) is **v1.5+** per master plan §5. See [`mobile/MOBILE_MVP.md`](./mobile/MOBILE_MVP.md). |
| **Real school data** | **Agre’s spreadsheet** remains the operational source of truth when available. Until then: seed data + optional CSV import ([`data/real-schools/`](./data/real-schools/)). |

## Implementation status (high level)

| Area | Status |
|------|--------|
| API `/api/v1` + OpenAPI | Shipped |
| Brand theme (globals, fonts, motion) | Shipped |
| Homepage: 100k progress + stat counters | Shipped |
| Map: district filter, gap pins, AnimatePresence | Shipped |
| Map: custom Mapbox Studio style | **Optional** — set `NEXT_PUBLIC_MAPBOX_STYLE` (see [`LOCAL-DEV.md`](./LOCAL-DEV.md)) |
| School profile: club, nets, coords, phase, story | Shipped |
| Admin: school CRUD, photos, CSV import | Shipped |
| Donor: Stripe + Brevo | **Cut for v1** — external giving only |
| Field Expo app + offline queue | MVP shipped — see `mobile/MOBILE_MVP.md` |
| Sentry / logging | API + web instrumentation present — verify DSN in each environment |
| Four-role auth | Donor + field worker + admin in API; super_admin role exists where seeded |

## UI parity vs COMPONENT-PICKS

Hand-built screens are **accepted for v1 pilot** where they implement the same **bones** (split hero, rotating story, etc.) with Pilgrim **skin**. Exact `npx shadcn add <21st url>` installs are **not** a v1 gate. Details: [`docs/UI_COMPONENT_SIGNOFF.md`](./docs/UI_COMPONENT_SIGNOFF.md).

## Related

- [`SMOKE_TESTS.md`](./SMOKE_TESTS.md) — pre-release checks
- [`LOCAL-DEV.md`](./LOCAL-DEV.md) — env vars including Mapbox style URL
