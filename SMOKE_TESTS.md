# Smoke tests — before a demo or production cut

Run these after deploy or before stakeholder review. Adapt URLs to your environment (`localhost` vs production).

## API

| Step | Pass criteria |
|------|----------------|
| `GET /health` | `200`, JSON indicates healthy |
| `GET /api/v1/schools` | `200`, array (may be empty) |
| `GET /api/v1/stats/map` | `200`, FeatureCollection |

## Web (donor)

| Step | Pass criteria |
|------|----------------|
| Open `/` | Hero loads; stats show or skeleton resolves |
| Open `/map` | Map renders; district filter changes pins |
| Open `/schools/<id>` | Profile loads for a valid seeded id |
| Open `/donate` | External giving + mailto links; **no** Stripe card form |
| Log in `donor@test.com` (after seed) → `/portal` | Donor portal loads |

## Web (admin)

| Step | Pass criteria |
|------|----------------|
| `NEXT_PUBLIC_MOCK=false`, API running | Required |
| Log in `admin@test.com` / `password123` | Redirects to `/admin` |
| `/admin` | School table lists rows; **Add school** opens dialog |

## Mobile (Expo)

Follow [`mobile/MOBILE_MVP.md`](./mobile/MOBILE_MVP.md) device E2E: login → list → report → my reports.

## Environment checks (production)

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Public API base ending in `/api/v1` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Valid token for map tiles |
| `NEXT_PUBLIC_MAPBOX_STYLE` | Optional custom Studio style |
| `NEXT_PUBLIC_MOCK` | Must be `false` for real data |
| `NEXT_PUBLIC_SENTRY_DSN` / API Sentry | Set if error tracking required |

## Regression: checkout disabled

`POST /api/v1/donations/checkout` with a donor JWT should return **410** (v1 pilot — no Stripe).
