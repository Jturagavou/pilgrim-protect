# Uganda schools (OpenStreetMap reference)

## Full extract (your machine)

The **national** CSV built with the Overpass API lives outside the repo by default, e.g.:

`~/Desktop/Uganda_Schools_Master_Database.csv`

That file is **not** committed here (tens of thousands of rows). Keep it as your working master for research, QA against Pilgrim/Agre data, and regenerating subsets.

## What is in this folder

| File | Purpose |
|------|--------|
| `uganda-schools-v1-prototype.csv` | **v1 prototype slice** — a small, reproducible subset of OSM schools in the **Teso + Karamoja pilot belt**, with `district` assigned to the **nearest** of the five pilot district centroids used in [`api/src/seed/seed.ts`](../../api/src/seed/seed.ts). |
| `generate-prototype-subset.py` | Regenerates the prototype CSV from any CSV with the same columns as your master export. |

## Licence (OSM)

OpenStreetMap data is © OpenStreetMap contributors and available under the **Open Database Licence (ODbL)**. Attribute OSM when publishing maps or derived datasets publicly.

## Columns in `uganda-schools-v1-prototype.csv`

| Column | Description |
|--------|-------------|
| `institution_name` | Name from OSM |
| `district` | **Heuristic:** nearest of Soroti, Amuria, Katakwi, Kumi, Moroto (centroid match — not Uganda MoE official boundaries) |
| `latitude` / `longitude` | WGS84 |
| `city_region_osm` | Original `City/Region` from your export (often `N/A` or a locality name) |
| `distance_km_to_centroid` | Straight-line km to assigned district centroid (sanity check) |
| `assigned_by` | `nearest_centroid_v1` |

## Regenerate the prototype subset

From the repo root (adjust `--input` if your master file moved):

```bash
python3 data/osm/generate-prototype-subset.py \
  --input ~/Desktop/Uganda_Schools_Master_Database.csv \
  --output data/osm/uganda-schools-v1-prototype.csv \
  --limit 120
```

Tune `--east-lat`, `--east-lng` bounding filters and `--max-deg` (max distance to a pilot centroid) inside the script if you need more or fewer rows.

## How this relates to the app

- **Not** automatically loaded into Mongo yet — the live `School` documents still come from [`api/src/seed/seed.ts`](../../api/src/seed/seed.ts) unless we add an importer (admin CSV / migration).
- Use this file for **prototype demos**, **name/coordinate cross-checks**, and future **CSV import** once Pilgrim confirms which schools belong in v1.
