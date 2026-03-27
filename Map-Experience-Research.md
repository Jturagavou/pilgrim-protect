# Pilgrim Protect Story — Map Experience Research
## Making the map the best part of the platform

---

## What the Map Actually Needs to Show

From the PDF requirements and our feature extraction:

### Data Layers
1. **School locations** — each school plotted by GPS coordinates across Uganda
2. **School status** — green (protected/sponsored), red (needs sponsor), potentially yellow (partially funded)
3. **District boundaries** — high-burden districts highlighted or outlined
4. **Malaria burden intensity** — heat map or choropleth showing incidence rates by region
5. **WHO public health data** — real-time or recent malaria burden stats overlaid

### Per-Marker Information (on click/tap)
6. School name
7. Student count
8. Malaria incidence data (cases per 1,000 students)
9. Before/after spraying stats
10. Sponsor status + cost per spraying cycle
11. Photo thumbnail of the school
12. "Sponsor This School" CTA button
13. Link to full school profile page

### Interactions Required
14. Zoom in/out smoothly
15. Filter by district
16. Filter by burden level
17. Filter by sponsor status (protected vs needs sponsor)
18. Click marker → detailed info panel (not just a tiny popup)
19. Cluster markers when zoomed out, expand on zoom
20. Fly-to animation when selecting a school from a list
21. Mobile-responsive (bottom sheet on phones, side panel on desktop)

### Nice-to-Have (our stretch goals for quality)
22. Guided "story tour" — auto-fly between featured schools
23. Custom branded markers (not default pins)
24. Terrain/3D subtle effect for Uganda's geography
25. Animated pulsing markers for schools needing sponsors
26. Smooth fade transitions when filtering
27. Dark mode option

---

## Option 1: Mapbox GL JS + react-map-gl

### What It Is
Mapbox GL JS is a WebGL-powered vector map renderer with Mapbox Studio for custom styling. react-map-gl is the official React wrapper (by Uber/vis.gl). This is what charity: water, Uber, Strava, and most premium map experiences use.

### Why It's the Premium Choice
- **Mapbox Studio** — visual drag-and-drop map style editor. You can design a custom map that matches Pilgrim Protect branding (muted land colors, highlighted Uganda borders, custom terrain shading) without writing code. This alone is what separates "looks like Google Maps" from "feels like *our* platform."
- **Vector tiles** — renders on GPU via WebGL. Buttery smooth zoom, pan, rotate, and tilt at 60fps. Leaflet uses raster tiles (pre-rendered images) which look pixelated between zoom levels.
- **3D terrain** — can show Uganda's actual topography with subtle 3D elevation. Not necessary, but adds a "wow" factor that makes the map feel alive.
- **Built-in animations** — `flyTo`, `easeTo`, and camera transitions are smooth and cinematic out of the box.
- **Custom markers** — full HTML/React markers, not just icons. We can put school photos, status badges, and pulse animations directly on the map.
- **Popups + Panels** — react-map-gl has a `Popup` component, but more importantly it lets us build fully custom React UI overlaid on the map — the side panel / bottom sheet experience we want.
- **Clustering** — Mapbox has native `supercluster` support built into the GL JS renderer. Extremely performant even with thousands of points.
- **Fog/atmosphere** — subtle atmospheric haze at the horizon that makes the map feel like you're looking at a real globe.

### Pricing (fits within $100/month budget)
- **Free tier:** 50,000 map loads/month
- **After free tier:** $5 per 1,000 loads
- **Realistic usage for a nonprofit site:** A few hundred to a few thousand visitors/month = **$0/month** (well within free tier)
- **Even at 10,000 visitors/month:** Still $0
- **At 100,000 map loads/month:** $250/month (way beyond what we'd see initially)

**For this project: Mapbox will almost certainly be free or under $25/month for years.**

### Nonprofit Program
Mapbox has a dedicated **Social Impact / Nonprofit program**:
- Since 2017, supported 900+ nonprofit organizations
- Donates $1M+/year in product credits, sponsorships, and pro bono services
- Applications reviewed in May and November
- Pilgrim Africa (fighting malaria in Uganda) is *exactly* the kind of project they support
- **We should apply.** Even if we stay in the free tier, getting official nonprofit status with Mapbox could give us extended credits and direct support.

### Tech Stack Integration
```
react-map-gl (React wrapper)
    ↓
Mapbox GL JS (WebGL renderer)
    ↓
Mapbox Studio (custom map style)
    +
deck.gl (optional: advanced data viz layers)
    +
supercluster (clustering)
```

### Can It Do Everything We Need?
| Requirement | Mapbox Support |
|---|---|
| School markers with custom icons | ✅ Full HTML/React markers |
| Green/red/yellow color coding | ✅ Data-driven styling |
| District boundaries | ✅ GeoJSON polygon layers |
| Malaria heat map | ✅ Heatmap layer built-in |
| WHO data overlay | ✅ Dynamic data sources |
| Smooth zoom/pan | ✅ WebGL — 60fps |
| Filter by district/burden/status | ✅ setFilter() on layers |
| Click → info panel | ✅ Custom React overlay |
| Marker clustering | ✅ Native supercluster |
| flyTo animation | ✅ Built-in, cinematic |
| Mobile bottom sheet | ✅ Custom React UI |
| Guided story tour | ✅ Camera animation API |
| 3D terrain | ✅ Built-in terrain layer |
| Pulse animation on markers | ✅ CSS + React markers |
| Dark mode | ✅ Mapbox Studio dark style |

**Score: 15/15 — handles everything.**

---

## Option 2: MapLibre GL JS + react-maplibre + MapTiler

### What It Is
MapLibre is the open-source fork of Mapbox GL JS (before Mapbox went proprietary). Same WebGL rendering engine, but fully free and open source. MapTiler provides the tile data and map styles.

### Why Consider It
- **100% free and open source** — MapLibre itself costs $0 forever. No usage limits, no API keys for the renderer.
- **Same rendering quality as Mapbox** — forked from the same codebase. WebGL, smooth animations, vector tiles.
- **react-maplibre** — official React wrapper, same API patterns as react-map-gl.
- **MapTiler styles** — MapTiler offers beautiful pre-made styles (similar quality to Mapbox Studio) and a visual editor.
- **Protomaps/PMTiles** — can self-host map tiles as a single static file. Zero tile server cost. Just put the file on Cloudflare R2 or S3.

### The Trade-offs vs Mapbox
- **No Mapbox Studio** — MapTiler's editor is good but not as polished as Mapbox Studio. Fewer one-click customization options.
- **Fewer built-in features** — no native fog/atmosphere, 3D terrain requires more setup, no built-in heatmap style (need to add as layer).
- **Smaller ecosystem** — fewer tutorials, fewer ready-made examples. When you Google a map problem, Mapbox answers come up first.
- **Self-hosting tiles adds complexity** — setting up PMTiles or MapTiler is an extra step vs Mapbox's "just works" tiles.

### Pricing
- **MapLibre GL JS:** $0 forever
- **MapTiler Cloud (for tiles + styles):**
  - Free: limited to non-commercial use only
  - Flex plan: $0.50 per 1,000 sessions + $0.05 per 1,000 tile requests
  - Starting plan: ~$25/month for 100K sessions
- **Protomaps (self-hosted tiles):** $0 (tiles hosted on your own storage)
  - Need Cloudflare R2 ($0.015/GB stored) or similar
  - One-time setup effort

### Can It Do Everything We Need?
| Requirement | MapLibre Support |
|---|---|
| School markers with custom icons | ✅ HTML markers |
| Green/red/yellow color coding | ✅ Data-driven styling |
| District boundaries | ✅ GeoJSON layers |
| Malaria heat map | ✅ Heatmap layer (via plugin) |
| WHO data overlay | ✅ Dynamic data sources |
| Smooth zoom/pan | ✅ WebGL — 60fps |
| Filter by district/burden/status | ✅ setFilter() |
| Click → info panel | ✅ Custom React overlay |
| Marker clustering | ✅ supercluster (manual setup) |
| flyTo animation | ✅ Built-in |
| Mobile bottom sheet | ✅ Custom React UI |
| Guided story tour | ✅ Camera animation API |
| 3D terrain | ⚠️ Possible but requires more setup |
| Pulse animation on markers | ✅ CSS + HTML markers |
| Dark mode | ✅ MapTiler dark style or custom |

**Score: 14/15 — handles almost everything, 3D terrain needs extra work.**

---

## Option 3: Mapbox GL JS + deck.gl (Maximum Premium)

### What It Is
Everything from Option 1, plus deck.gl — a GPU-powered data visualization framework by Uber/vis.gl that runs on top of Mapbox or MapLibre. This is what companies use for visualizing millions of data points on maps.

### Why Consider It
- **Animated transitions between data states** — when you filter schools, markers don't just appear/disappear. They morph, fade, and animate smoothly on the GPU.
- **Arc layers** — could show donation flows: arcs from donor locations to schools. Visual "impact" lines.
- **Hexagonal aggregation** — instead of marker clusters, show hexagonal density layers for malaria burden data.
- **GPU-accelerated** — handles thousands of animated points at 60fps where other libraries choke.
- **Trip layer** — could animate a "spray team route" showing the path field workers take between schools.

### The Trade-offs
- **Adds complexity** — another library to learn and maintain.
- **Overkill for 10-50 schools** — deck.gl shines with 10,000+ data points. With our school count, the visual difference over plain Mapbox is subtle.
- **Bigger bundle size** — more JavaScript shipped to the user.

### Pricing
Same as Option 1 (Mapbox pricing) + deck.gl is free/open source.

### Verdict
**Not worth it for launch.** deck.gl is amazing, but it's designed for massive datasets. With 10-50 schools, Mapbox GL JS alone delivers a premium experience. We can always add deck.gl later if we're visualizing thousands of data points (e.g., malaria case data at the village level).

---

## Option 4: Leaflet with Premium Tiles (Original Plan, Enhanced)

### What It Is
Stick with Leaflet but upgrade the tile provider and add polished UI components.

### Upgrades from Default Leaflet
- **Stadia Maps Alidade Smooth** tiles — modern, clean, free for low traffic
- **Custom SVG markers** instead of default blue pins
- **Leaflet Sidebar v2** plugin for the info panel
- **Leaflet.markercluster** for clustering
- **CSS animations** for marker hover/pulse effects

### The Hard Truth
- **Raster rendering** — no matter how much we polish, Leaflet still renders pre-made image tiles. Zooming between levels shows pixelation. Panning has slight jank compared to WebGL.
- **No flyTo cinematics** — Leaflet has `flyTo` but it's noticeably less smooth than Mapbox/MapLibre WebGL animations.
- **No 3D terrain** — not possible with Leaflet.
- **No data-driven styling** — can't change marker appearance based on data properties without writing custom code for each case.
- **Mobile experience ceiling** — the gestures and interactions can't match what WebGL map libraries offer.

### Pricing
$0 (fully free)

### Verdict
Leaflet with premium tiles is "good." But you specifically said you want this map to feel refined and make the whole platform feel premium. **Leaflet has a ceiling that Mapbox and MapLibre don't.** The difference is visible and felt.

---

## RECOMMENDATION

### Go with: **Mapbox GL JS + react-map-gl + Mapbox Studio**

Here's why this fits your situation perfectly:

**1. Cost: $0/month (realistically)**
50,000 free map loads/month. A nonprofit site about malaria prevention in Uganda is not going to hit 50K map loads for a long time. Even if you do — $5 per 1,000 loads means 60,000 loads = $50. Well within your $100 budget.

**2. Apply for Mapbox Nonprofit Program**
Pilgrim Africa fighting malaria in Uganda is exactly the kind of project Mapbox's Social Impact team supports. They review applications in May and November. Even if we stay under the free tier, having nonprofit status gives us credits, support, and potential promotion.

**3. Mapbox Studio is the secret weapon**
This is the thing that makes the difference between "a map with pins" and "an experience." You design a custom map style that matches Pilgrim Protect's branding — muted terrain colors, highlighted Uganda borders, custom colors for districts, subtle terrain shading. When someone opens the map, it doesn't look like Google Maps or OpenStreetMap. It looks like *Pilgrim Protect's map.* This is what charity: water did and it's why their map feels premium.

**4. The interaction quality is unmatched**
WebGL rendering means 60fps panning, buttery smooth flyTo animations, real-time filter transitions. On mobile, the pinch-zoom and gesture handling is noticeably better than Leaflet. The difference is like comparing a native app to a mobile website — both "work," but one *feels* right.

**5. Everything we need is built-in**
Custom React markers, clustering, heatmap layers, GeoJSON district boundaries, camera animations, fog/atmosphere, 3D terrain — all included. No hunting for plugins, no compatibility issues.

**6. Future-proof**
If the platform grows, if we add more countries, if we visualize WHO data at scale — Mapbox handles it without a rewrite. With Leaflet, we'd eventually hit a wall and need to migrate.

### Monthly Cost Projection
| Traffic Level | Map Loads/Month | Monthly Cost |
|---|---|---|
| Development | <100 | $0 |
| Soft launch | 1,000-5,000 | $0 |
| Active nonprofit site | 5,000-20,000 | $0 |
| Viral campaign | 50,000-60,000 | $0-50 |
| Sustained high traffic | 100,000+ | $100+ (apply for nonprofit credits) |

### Implementation Plan
1. Create Mapbox account → get free API token
2. Design custom map style in Mapbox Studio (branded for Pilgrim Protect)
3. Set up react-map-gl in Next.js project
4. Build custom school markers (React components on the map)
5. Add GeoJSON layer for Uganda district boundaries
6. Implement supercluster for marker clustering
7. Build side panel (desktop) / bottom sheet (mobile) for school details
8. Add flyTo animations for school selection
9. Build filter controls (district, burden level, status)
10. Add malaria burden heatmap layer (WHO data)
11. Build guided "story tour" feature
12. Apply for Mapbox Nonprofit Program

### Fallback Plan
If Mapbox pricing ever becomes a concern: **swap to MapLibre GL JS.** Since react-map-gl supports both Mapbox and MapLibre, the switch is changing one import and one tile source URL. Our custom React components, panels, filters — all stay the same. We're not locked in.
