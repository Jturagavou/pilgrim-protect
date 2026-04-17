# Real school data — import path

Agre’s spreadsheet is the **operational source of truth** when available. The repo does **not** contain confidential production data.

## Column format (admin bulk import)

The web admin **Import CSV** feature and `POST /api/v1/schools/bulk` accept rows parsed by [`web/lib/schoolCsv.ts`](../../web/lib/schoolCsv.ts).

**Required header row** (order can vary; matching is by header **name**):

| Column | Required | Notes |
|--------|----------|--------|
| `name` | yes | School name |
| `district` | yes | e.g. Soroti, Amuria |
| `lng` | yes | Longitude (WGS84) |
| `lat` | yes | Latitude (WGS84) |
| `subCounty` or `sub_county` | no | |
| `studentCount` or `students` | no | Defaults 0 |
| `totalRooms` or `rooms` | no | Defaults 0 |
| `netsCount` or `nets` | no | Defaults 0 |
| `hasMalariaClub` or `malaria_club` | no | `true` / `false` / `yes` / `1` |
| `sponsorshipStatus` or `phase` | no | One of: `needs-funding`, `funded`, `contracted`, `checked-in`, `data-gathered` |

Simple CSV only: **no commas inside quoted fields** in the parser (one row = comma-separated).

## Template file

See [`agre-import-template.csv`](./agre-import-template.csv) for a header + example rows. Replace with real data locally; do not commit secrets.

## How to load into MongoDB

1. Run API + Mongo (`LOCAL-DEV.md`).
2. Log in as admin (`admin@test.com` after seed) → **http://localhost:3000/admin** with `NEXT_PUBLIC_MOCK=false`.
3. **Import CSV** — or `POST /api/v1/schools/bulk` with JSON `{ "schools": [ ... ] }` matching [`SchoolInput`](../../api/openapi.yaml) fields.

For a **full replace** of demo seed data, clear schools in Mongo (or use a fresh DB) before bulk import.
