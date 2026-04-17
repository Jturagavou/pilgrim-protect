# Field worker app — v1 MVP vs master plan §5 (v1.5+)

This document **locks scope** for the Expo app in [`mobile/`](./) relative to OM **`planning/MASTER-BUILD-PLAN.md` §5** (v1.5+ mobile architecture).

## v1 MVP (shipped / intended for pilot)

| Capability | Implementation |
|------------|------------------|
| Login (field worker JWT) | [`src/screens/LoginScreen.js`](./src/screens/LoginScreen.js) + [`src/lib/auth.js`](./src/lib/auth.js) |
| List schools | [`src/screens/SchoolListScreen.js`](./src/screens/SchoolListScreen.js) |
| Submit spray report (rooms, photos, GPS, notes) | [`src/screens/SprayReportScreen.js`](./src/screens/SprayReportScreen.js) |
| List my reports | [`src/screens/MyReportsScreen.js`](./src/screens/MyReportsScreen.js) |
| Offline queue + sync when online | [`src/lib/offlineQueue.js`](./src/lib/offlineQueue.js) + NetInfo |
| API base `…/api/v1` | [`src/lib/api.js`](./src/lib/api.js) |

**School metadata edits** (nets count, malaria club, phase) on-device are **not** in v1 MVP — workers use the **web admin** or future scoped APIs. The master plan’s richer **PATCH /schools** from the field app is **v1.5+**.

## Deferred to v1.5+ (master plan §5)

- SQLite / `expo-sqlite` as single source of truth for pending work (v1 uses AsyncStorage queue).
- `GET /api/sync/schools?since=…` delta sync.
- Admin role in the same app + photo **moderation queue**.
- Background fetch / exponential backoff beyond current auto-sync.

## Device E2E smoke (local)

Prerequisites: Mongo running, `cd api && npm run seed`, API on **8080**, phone on same LAN as your Mac.

1. Set `mobile/.env`: `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:8080/api/v1`
2. `cd mobile && npx expo start`
3. Expo Go: log in `worker1@test.com` / `password123`
4. Confirm school list loads (not mock: ensure API reachable — health check passes).
5. Open a school → **New Report** → submit with 1 photo (or skip photo) → verify appears under **My Reports**.

If the API is unreachable, dev builds may fall back to **mock mode** (see `api.js`).
