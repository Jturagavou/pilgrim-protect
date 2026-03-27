# Pilgrim Protect — Field Worker Mobile App Design
## Lightweight Spray Check-In Tool for Uganda

---

## 1. What This App Does

A lightweight mobile app carried by Pilgrim Africa field workers during school spraying campaigns in Uganda. One job: **make it dead simple to record what was sprayed, where, and when — even with no internet.**

The app is not a complex data platform. It's a check-in tool. Arrive at a school, confirm you're there, log the spray event, snap photos, submit. That data flows to the same Express API that powers the donor-facing website, keeping the interactive map honest and up-to-date.

---

## 2. Target Users & Environment

### Who uses this
- Pilgrim Africa spray teams (2-6 people per team)
- Team leaders carry the phone and do the logging
- Not tech-savvy — the app must be usable with minimal training
- Luganda speakers primarily, English secondary

### Where they use it
- Rural Uganda — schools in Nakaseke, Luwero, Wakiso, Mukono, and surrounding districts
- Mobile connectivity is **unreliable**: some areas have 3G/4G, others have nothing
- Phones are mid-range Android devices (Samsung A-series, Tecno, Infinix common in Uganda)
- Battery life matters — workers are in the field all day
- Bright sunlight — screen must be readable outdoors

### Key constraints driving every design decision
| Constraint | Design Impact |
|-----------|---------------|
| No internet for hours | Offline-first architecture — everything works without connectivity |
| Low-end Android phones | Minimal memory usage, no heavy animations, small APK size |
| Non-technical users | Maximum 3 taps to complete any action, large touch targets |
| Bright sunlight | High contrast UI, large text, dark-on-light scheme |
| Battery conservation | No background GPS polling, no continuous sync, minimal wake-locks |
| Luganda + English | Full i18n from day one, right-to-left not needed |

---

## 3. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Expo (React Native) SDK 53+ | Managed workflow = no native code maintenance, OTA updates, EAS Build for APK distribution |
| **Local Database** | WatermelonDB (SQLite under the hood) | Built for offline-first React Native apps. Lazy loading, reactive queries, built-in sync protocol. 500K+ users across production apps, 99.8% sync success rate |
| **Sync** | WatermelonDB Sync + custom Express endpoints | Pull/push with `last_pulled_at` timestamps. Conflict resolution: server wins for school data, client wins for spray records (field worker was there) |
| **Camera** | expo-image-picker + expo-camera | Photo capture with compression before storage. Max 1MB per photo to save bandwidth |
| **GPS** | expo-location | One-time foreground location fix on check-in (not background tracking). Compares worker GPS to school coordinates |
| **File Upload** | expo-file-system + custom upload queue | Photos stored locally, uploaded in background when connectivity returns. Retry with exponential backoff |
| **Auth** | JWT tokens from existing Express API | Simple login with phone number + PIN. Token stored securely in expo-secure-store |
| **State Management** | Zustand (lightweight) | Minimal global state: current user, sync status, active assignment |
| **Navigation** | expo-router (file-based routing) | Consistent with web platform's Next.js file-based routing pattern |
| **i18n** | i18next + react-i18next | Same translation approach as web platform. Start with English + Luganda |
| **Distribution** | EAS Build → APK sideload or Google Play internal testing | No App Store needed initially — distribute APK directly to team phones |

### Why WatermelonDB over alternatives?

We considered several offline database options:

**expo-sqlite (raw SQLite):** Full control but you write all the sync logic yourself — conflict resolution, change tracking, reactive queries. Too much custom code for a team learning React Native.

**Realm (MongoDB):** Good sync with MongoDB Atlas, but heavyweight, adds 5-10MB to APK, and the free tier has limitations. Also, its React Native support has been inconsistent.

**WatermelonDB:** Built specifically for this use case — offline-first React Native with sync. It handles change tracking automatically, has a built-in sync protocol that maps cleanly to our Express API, uses lazy loading so it won't choke on low-end phones, and the Expo plugin means no ejecting. The tradeoff is a learning curve for its model/schema system, but that's a one-time cost.

---

## 4. App Screens

The app has exactly **6 screens**. Fewer screens = less confusion for non-technical users.

### Screen 1: Login
**What it does:** Authenticate the field worker.

- Phone number + 4-digit PIN (not email/password — field workers don't always have email)
- "Remember me" toggle so they don't re-login daily
- Language selector (English / Luganda) on login screen
- JWT token stored in secure storage
- Works offline after first login (token cached locally)

### Screen 2: My Assignments (Home Screen)
**What it does:** Show today's work — which schools to spray.

- List of assigned schools for the current campaign/cycle
- Each card shows: school name, district, distance from current location, number of buildings
- Color coding: grey = not yet visited, green = completed, orange = partially done
- Pull-to-refresh when online
- Tap a school → go to School Check-In screen
- Top bar shows: sync status indicator (green dot = synced, orange = pending, red = offline), number of pending uploads
- Floating "Quick Log" button for unassigned schools (worker encounters a school not on their list)

### Screen 3: School Check-In
**What it does:** The main work screen — log a spray event at a specific school.

**Step 1 — Confirm Location**
- App requests one-time GPS fix
- Shows school name and expected coordinates
- If GPS matches within 200m → green checkmark, auto-confirmed
- If GPS doesn't match or is unavailable → manual confirmation button ("I am at this school")
- Shows simple map pin on a static map image (no Mapbox needed — just a pre-rendered tile or even just text coordinates)

**Step 2 — Log the Spray**
- Buildings sprayed: number picker (pre-filled with school's total building count)
- Insecticide used: dropdown (Actellic 300CS, Fludora Fusion, or "Other" with text field)
- Team members: multi-select from pre-loaded team roster, or type names
- Current malaria cases: number input (optional — worker may not know this)
- Notes: free text field ("2 classrooms locked, will return Thursday")

**Step 3 — Photos**
- "Take Photo" button → camera opens
- Minimum 1 photo required, maximum 5
- Each photo gets a type tag: "Before" / "During" / "After"
- Photos compressed to max 1MB and stored locally
- Thumbnail previews shown inline

**Step 4 — Submit**
- Review summary of everything entered
- "Submit" button
- If online → sends immediately to API, shows success checkmark
- If offline → saves to local WatermelonDB, shows "Saved — will sync when online" message
- Returns to assignments list with that school marked green

### Screen 4: Sync Status
**What it does:** Show what's been uploaded and what's still waiting.

- List of all pending spray records with timestamps
- Each item shows: school name, date logged, sync status (pending / uploading / synced / failed)
- Photo upload progress bars for large uploads
- "Sync Now" button (manual trigger when worker finds connectivity)
- Error details for failed syncs (e.g., "Photo too large", "Server error — will retry")
- Total stats: "12 records synced, 3 pending, 2 photos uploading"

### Screen 5: School Directory
**What it does:** Browse all schools in the system (read-only reference).

- Searchable list of all schools synced to the device
- Each entry shows: name, district, student count, last spray date, status color
- Tap → read-only school detail (location, contact person, spray history)
- Useful for: finding a school not on today's assignments, checking spray history before arriving
- Data synced from server on login and periodically refreshed

### Screen 6: Profile & Settings
**What it does:** Account and app settings.

- Worker name and role
- Language toggle (English / Luganda)
- Last sync timestamp
- Storage usage (local database + cached photos)
- "Clear cached photos" button (for photos already synced)
- App version
- Logout

---

## 5. Offline-First Architecture

This is the most critical technical aspect. The app must work flawlessly with zero connectivity for hours or even days.

### How data flows

```
┌─────────────────────────────────────────────────────┐
│                    FIELD (OFFLINE)                    │
│                                                       │
│  Worker opens app → sees cached assignments           │
│  Worker checks in at school → logs spray event        │
│  Worker takes photos → saved to local file system     │
│  SprayRecord saved to WatermelonDB (local SQLite)     │
│  Photos queued in upload queue (file system)           │
│                                                       │
│  ── connectivity returns ──                           │
│                                                       │
│  WatermelonDB sync triggers (push local changes)      │
│  Upload queue processes photos → Cloudinary            │
│  Pull latest school data + new assignments             │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────┐
│                EXPRESS API (same backend)              │
│                                                       │
│  POST /api/schools/:id/spray-records ← new record     │
│  POST /api/uploads ← photos → Cloudinary              │
│  GET /api/sync/pull?last_pulled_at=... → changes      │
│  POST /api/sync/push ← local changes                  │
│  GET /api/assignments/:workerId → school list          │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              MONGODB ATLAS (same database)             │
│                                                       │
│  SprayRecords collection ← new records land here      │
│  Schools collection ← status recomputed               │
│  Map on website updates automatically                  │
└─────────────────────────────────────────────────────┘
```

### Sync strategy details

**When does sync happen?**
1. On app open (if online)
2. After submitting a spray record (if online)
3. When device regains connectivity (network change listener)
4. Manual "Sync Now" button
5. Never in background when app is closed (saves battery)

**What syncs down (server → device)?**
- School master data (name, coordinates, building count, contact)
- Worker's assignment list for current campaign
- Team roster (names for the multi-select on check-in)
- Campaign configuration (which insecticides are in use, cycle number)

**What syncs up (device → server)?**
- New SprayRecord documents
- Photos (uploaded separately to Cloudinary, URLs attached to SprayRecord)
- GPS confirmation data

**Conflict resolution:**
- School data: **server wins** (admin is the source of truth for school info)
- SprayRecords: **client wins** (the field worker was physically there — their record is authoritative)
- If the same school was logged by two workers (rare but possible): both records kept, admin resolves in web dashboard

**Photo upload queue:**
- Photos stored in app's local file system with unique IDs
- Upload queue processes one photo at a time (bandwidth conservation)
- Each photo: compress → upload to Cloudinary via Express API → receive URL → attach URL to SprayRecord → delete local copy
- Retry failed uploads with exponential backoff: 5s → 15s → 45s → 2min → stop, flag for manual retry
- If photo upload fails permanently, SprayRecord still syncs (text data is more important than photos)

---

## 6. Data Model (Local WatermelonDB Schema)

These mirror the MongoDB collections on the server but are stored locally in SQLite via WatermelonDB.

### Local Tables

**schools** (synced down from server)
```
id mod: string (WatermelonDB internal)
server_id: string         // MongoDB _id
name: string
district: string
sub_county: string
lat: number
lng: number
student_count: number
building_count: number
contact_name: string
contact_phone: string
cost_per_cycle: number
last_spray_date: number   // timestamp, nullable
status: string            // computed on sync: "protected" | "fading" | "needs_spray"
```

**assignments** (synced down from server)
```
id: string
school_id: string         // references local schools table
campaign_id: string
assigned_date: number
priority: number          // 1 = high, 2 = medium, 3 = low
completed: boolean
```

**spray_records** (created locally, synced up to server)
```
id: string
school_id: string
date: number
buildings_sprayed: number
total_buildings: number
insecticide: string
team_members: string      // JSON array stored as string
malaria_cases: number     // nullable
notes: string
gps_lat: number
gps_lng: number
gps_confirmed: boolean
submitted_via: string     // always "mobile_app"
synced: boolean           // false until pushed to server
```

**photo_queue** (local only — not synced via WatermelonDB)
```
id: string
spray_record_id: string
local_path: string        // file system path
type: string              // "before" | "during" | "after"
caption: string
upload_status: string     // "pending" | "uploading" | "uploaded" | "failed"
cloudinary_url: string    // null until uploaded
retry_count: number
```

**team_members** (synced down from server)
```
id: string
name: string
role: string              // "spray_operator" | "team_leader" | "supervisor"
phone: string
active: boolean
```

---

## 7. API Endpoints (additions to existing Express backend)

These endpoints are added to the existing Express API alongside the web platform endpoints.

### Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sync/pull` | Pull changes since `last_pulled_at` timestamp. Returns updated schools, assignments, team members |
| POST | `/api/sync/push` | Push new/updated spray records from device |

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments/:workerId` | Get assigned schools for current campaign |
| PUT | `/api/assignments/:id/complete` | Mark assignment as completed |

### Worker Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/worker/login` | Login with phone + PIN |
| POST | `/api/auth/worker/register` | Register new field worker (admin only) |
| GET | `/api/auth/worker/me` | Get current worker profile |

### Photo Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/uploads/spray-photo` | Upload a spray event photo → Cloudinary → return URL |

### Campaign Management (used by admin on web, consumed by mobile)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns/active` | Get current active campaign details |
| GET | `/api/campaigns/:id/insecticides` | Get insecticide options for the campaign |

---

## 8. Authentication

Field workers authenticate differently from donors on the website.

**Why phone + PIN instead of email/password?**
- Most field workers in rural Uganda use phone numbers as their primary identity
- Email addresses are often not used or shared
- A 4-digit PIN is easier to remember and type on a phone than a password
- Phone number also serves as a contact method for the team

**Flow:**
1. Admin registers worker via web dashboard: enters name, phone number, role
2. System generates a 4-digit PIN and sends it via SMS (Brevo transactional SMS or manual distribution)
3. Worker enters phone + PIN on first login
4. Server returns JWT token (long-lived: 30 days, since workers may go offline for extended periods)
5. Token stored in expo-secure-store (encrypted on device)
6. Subsequent app opens use cached token — no re-login needed
7. PIN change available in settings

**Role-based access:**
- `spray_operator`: can create spray records, take photos
- `team_leader`: same as operator + can view all team members' records
- `supervisor`: same as leader + can create assignments, manage team roster

---

## 9. GPS & Location Strategy

GPS is used **only** to confirm the worker is at the right school. Not for tracking.

**How it works:**
1. Worker taps "Check In" on a school
2. App requests a single foreground GPS fix (expo-location `getCurrentPositionAsync`)
3. Accuracy target: 50m (switches to lower accuracy after 10 seconds to save battery)
4. Compare worker's GPS to school's stored coordinates
5. If within 200m → auto-confirmed (green check)
6. If 200m-1km → warning: "You appear to be [X]m from the school. Confirm you're at the right location?"
7. If >1km or GPS unavailable → manual confirmation required, GPS mismatch flagged in the record
8. GPS coordinates stored in the SprayRecord regardless — admin can review discrepancies

**Why not background location tracking?**
- Massive battery drain on low-end phones
- Privacy concerns
- Not needed — we only care about "were you at the school when you logged the spray?"
- Workers already have phones with limited battery for a full day in the field

---

## 10. Photo Handling

Photos are the second most important data after the spray record itself. They prove the work happened and appear on the donor-facing website.

**Capture:**
- Use expo-image-picker (camera mode)
- Force rear camera (better quality for documenting buildings)
- Max resolution: 1920x1080 (sufficient quality, manageable file size)
- Compress to max 1MB before local storage (JPEG quality 70%)

**Local storage:**
- Photos saved to app's document directory (persists across app restarts)
- Filename format: `spray_{recordId}_{timestamp}_{type}.jpg`
- Thumbnail generated at 200x200 for list display (saves memory on low-end phones)

**Upload:**
- Photos upload separately from spray record data
- Upload queue processes sequentially (one at a time, conserves bandwidth)
- Each photo uploaded to Cloudinary via Express API endpoint
- On success: Cloudinary URL attached to SprayRecord, local file deleted
- On failure: retry with backoff, keep local file
- If all retries fail: flag photo as "upload_failed", spray record still valid

**Storage budget:**
- Average 3 photos per spray event × 1MB = 3MB per event
- 20 events per day = 60MB per day
- Phone should hold at least 1 week of unsynced photos = ~420MB
- "Clear synced photos" button in settings for manual cleanup

---

## 11. Internationalization (i18n)

**Languages at launch:** English, Luganda

**Approach:**
- All UI strings in translation files (JSON), never hardcoded
- Same i18next library and pattern as the web platform
- Language selected on login screen, changeable in settings
- Stored locally — persists offline

**Translation file structure:**
```
apps/mobile/locales/
├── en.json    # English (default)
└── lg.json    # Luganda
```

**What gets translated:**
- All button labels, headings, instructions
- Error messages and status text
- Insecticide names (if local names differ)
- School names stay as-is (proper nouns)

**Future languages:** Runyankole, Ateso, Luo — add JSON files as needed, no code changes.

---

## 12. Project Structure

Slots into the existing monorepo as `apps/mobile/`:

```
pilgrim-protect/
├── apps/
│   ├── web/                    # Next.js (existing)
│   ├── api/                    # Express (existing)
│   └── mobile/                 # ← NEW: Expo app
│       ├── app/                     # expo-router file-based routes
│       │   ├── _layout.tsx          # Root layout (auth check, providers)
│       │   ├── login.tsx            # Login screen
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx      # Tab navigator
│       │   │   ├── index.tsx        # My Assignments (home)
│       │   │   ├── directory.tsx    # School Directory
│       │   │   ├── sync.tsx         # Sync Status
│       │   │   └── profile.tsx      # Profile & Settings
│       │   └── checkin/
│       │       └── [schoolId].tsx   # School Check-In (spray logging)
│       ├── components/
│       │   ├── SchoolCard.tsx       # Assignment list item
│       │   ├── PhotoCapture.tsx     # Camera + thumbnail grid
│       │   ├── GpsConfirm.tsx       # Location verification
│       │   ├── SyncBadge.tsx        # Sync status indicator
│       │   └── NumberPicker.tsx     # Building count selector
│       ├── db/
│       │   ├── schema.ts           # WatermelonDB table schemas
│       │   ├── models/
│       │   │   ├── School.ts
│       │   │   ├── Assignment.ts
│       │   │   ├── SprayRecord.ts
│       │   │   └── TeamMember.ts
│       │   ├── sync.ts             # WatermelonDB sync implementation
│       │   └── index.ts            # Database initialization
│       ├── services/
│       │   ├── api.ts              # Express API client
│       │   ├── auth.ts             # JWT auth + secure storage
│       │   ├── location.ts         # GPS wrapper
│       │   ├── photoQueue.ts       # Photo upload queue manager
│       │   └── connectivity.ts     # Network status listener
│       ├── stores/
│       │   └── appStore.ts         # Zustand global state
│       ├── locales/
│       │   ├── en.json
│       │   └── lg.json
│       ├── hooks/
│       │   ├── useSync.ts          # Sync status + trigger
│       │   ├── useLocation.ts      # GPS wrapper hook
│       │   └── usePhotoQueue.ts    # Photo queue status
│       ├── types/                  # References packages/shared/types
│       ├── app.json                # Expo config
│       ├── eas.json                # EAS Build config
│       └── package.json
│
├── packages/
│   └── shared/                # Shared types (used by web + api + mobile)
│       ├── types/
│       │   ├── school.ts
│       │   ├── sprayRecord.ts      # ← shared with mobile
│       │   ├── assignment.ts       # ← NEW
│       │   └── worker.ts           # ← NEW
│       └── validators/
└── ...
```

---

## 13. Build Phases

### Phase 1: Foundation + Login + Assignments (Week 1-2)
- [ ] Initialize Expo project in `apps/mobile/`
- [ ] Set up expo-router with tab navigation
- [ ] Set up WatermelonDB with schema and models
- [ ] Build login screen (phone + PIN)
- [ ] Implement JWT auth with expo-secure-store
- [ ] Build assignments home screen (list of schools)
- [ ] Add sync endpoints to Express API (`/api/sync/pull`, `/api/sync/push`)
- [ ] Add worker auth endpoints (`/api/auth/worker/login`)
- [ ] First sync: pull school data and assignments on login
- [ ] Test on Android emulator and one physical device

### Phase 2: Check-In Flow + GPS + Photos (Week 3-4)
- [ ] Build School Check-In screen (4-step flow)
- [ ] Implement GPS confirmation (expo-location)
- [ ] Build photo capture component (expo-image-picker)
- [ ] Photo compression and local storage
- [ ] SprayRecord creation in WatermelonDB
- [ ] Photo upload queue with retry logic
- [ ] Add spray record sync (push to server)
- [ ] Test full offline flow: log spray → go offline → come back → sync
- [ ] Test on low-end Android device (Tecno or similar)

### Phase 3: Polish + i18n + Distribution (Week 5-6)
- [ ] Add Luganda translations
- [ ] Build Sync Status screen
- [ ] Build School Directory screen (read-only browse)
- [ ] Build Profile & Settings screen
- [ ] Connectivity listener (auto-sync when back online)
- [ ] Error handling and user-friendly error messages
- [ ] Performance testing on low-end devices
- [ ] Battery usage testing (full day simulation)
- [ ] Set up EAS Build for APK generation
- [ ] Distribute test APK to 2-3 field workers for real-world testing

### Phase 4: Admin Tools on Web (Week 7-8)
- [ ] Add campaign management to web admin panel
- [ ] Add worker management (register, assign, view records)
- [ ] Assignment creation interface (assign schools to workers)
- [ ] Spray record review dashboard (flag GPS mismatches, missing photos)
- [ ] Photo moderation before publishing to donor-facing map
- [ ] Real-time field activity feed (as workers sync, records appear)

---

## 14. APK Size Budget

Target: **under 25MB** installed. Field workers may download via mobile data.

| Component | Estimated Size |
|-----------|---------------|
| Expo runtime + React Native | ~12MB |
| WatermelonDB (SQLite) | ~3MB |
| App code + assets | ~2MB |
| expo-location + expo-image-picker | ~2MB |
| Zustand + i18next + other deps | ~1MB |
| **Total** | **~20MB** |

---

## 15. What This App Does NOT Do

Keeping scope tight for a lightweight tool:

- No Mapbox or interactive map (just text coordinates and a simple GPS confirm)
- No donor features (that's the website)
- No payment handling
- No story/blog creation (workers take photos, admins write stories on the web)
- No background location tracking
- No push notifications in v1 (add later if needed)
- No video recording (photos only — bandwidth constraint)
- No complex reporting or analytics (that's the web admin dashboard)
- No iOS build in v1 (Android only — the phones field workers actually have)

---

## 16. Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| WatermelonDB sync conflicts | Medium | Medium | Clear conflict rules: server wins for school data, client wins for spray records. Admin review dashboard for edge cases |
| Photos never upload (persistent poor connectivity) | Medium | Low | Spray record data syncs without photos. Photos retry indefinitely. Manual "share via WhatsApp" fallback for critical photos |
| GPS unavailable at school | High | Low | Manual confirmation option. GPS mismatch flagged but doesn't block submission |
| Worker loses/breaks phone mid-campaign | Low | High | All synced data safe on server. Re-login on new phone pulls down assignments. Unsynced records lost — mitigated by encouraging frequent sync |
| Low-end phone runs out of storage | Medium | Medium | Photo compression (1MB max), auto-cleanup of synced photos, storage usage indicator in settings |
| Workers forget to use the app | High | High | Keep the app faster than paper. 3-tap check-in flow. Team leaders accountable for completeness. Admin dashboard shows gaps |

---

## 17. Success Metrics

How we know the app is working:

- **Sync success rate > 95%** — spray records making it from device to server
- **Average check-in time < 3 minutes** — faster than paper forms
- **Photo attachment rate > 80%** — most spray records include at least one photo
- **GPS confirmation rate > 70%** — most check-ins have GPS match
- **Zero data loss** — no spray records lost due to app crashes or sync failures
- **Map freshness** — donor-facing map updates within 24 hours of a spray event (limited by connectivity, not by app)

---

## 18. Open Questions for Pilgrim Africa

Before building, we need answers to:

1. **How many field workers** will use the app initially? (Determines server load planning)
2. **What phones do they carry?** (Need to test on actual devices — Android version, RAM, storage)
3. **How are campaigns currently tracked?** Paper forms? Spreadsheets? This helps us design the data migration
4. **Is there an existing list of all target schools with GPS coordinates?** Or do we need to collect this?
5. **Who assigns schools to workers?** A field supervisor? Someone in the Kampala office?
6. **How many spray cycles per year per school?** (Determines the status color thresholds)
7. **What insecticides are currently in use?** (For the dropdown options)
8. **Is SMS delivery reliable in the field areas?** (For PIN distribution)
9. **Do workers have Google accounts on their phones?** (Affects Play Store vs direct APK distribution)
10. **What's the typical campaign duration?** (Days? Weeks? Affects offline storage needs)
