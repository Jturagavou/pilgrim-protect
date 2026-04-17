#!/usr/bin/env python3
"""Created with Cursor — AI-assisted.

Build a small v1 prototype CSV from a national OSM school export.
District names are assigned by nearest pilot centroid (same logic as seed.ts).
"""

from __future__ import annotations

import argparse
import csv
import math
import random
from pathlib import Path

# Pilot district centroids — keep in sync with api/src/seed/seed.ts DISTRICTS
PILOT_DISTRICTS: list[tuple[str, float, float]] = [
    ("Soroti", 1.7036, 33.611),
    ("Amuria", 1.997, 33.6438),
    ("Katakwi", 1.8958, 33.9662),
    ("Kumi", 1.4603, 33.9326),
    ("Moroto", 2.5347, 34.6667),
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(min(1.0, a)))


def nearest_district(lat: float, lng: float) -> tuple[str, float]:
    best = PILOT_DISTRICTS[0][0]
    best_km = float("inf")
    for name, dlat, dlng in PILOT_DISTRICTS:
        d = haversine_km(lat, lng, dlat, dlng)
        if d < best_km:
            best_km = d
            best = name
    return best, best_km


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path, help="Full Uganda OSM CSV path")
    ap.add_argument(
        "--output",
        type=Path,
        default=Path("data/osm/uganda-schools-v1-prototype.csv"),
    )
    ap.add_argument("--limit", type=int, default=120, help="Max rows after filtering")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument(
        "--lat-min",
        type=float,
        default=1.15,
        help="Rough Eastern Uganda filter (south)",
    )
    ap.add_argument("--lat-max", type=float, default=2.95, help="Rough Eastern Uganda filter (north)")
    ap.add_argument("--lng-min", type=float, default=33.1, help="Rough Eastern Uganda filter (west)")
    ap.add_argument("--lng-max", type=float, default=35.45, help="Rough Eastern Uganda filter (east)")
    ap.add_argument(
        "--max-km",
        type=float,
        default=95.0,
        help="Drop schools farther than this from their nearest pilot centroid",
    )
    args = ap.parse_args()

    random.seed(args.seed)

    rows_out: list[dict[str, str | float]] = []
    with args.input.open(newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                lat = float(row["Latitude"].strip())
                lng = float(row["Longitude"].strip())
            except (KeyError, ValueError):
                continue
            if not (
                args.lat_min <= lat <= args.lat_max and args.lng_min <= lng <= args.lng_max
            ):
                continue
            dname, dkm = nearest_district(lat, lng)
            if dkm > args.max_km:
                continue
            name = (row.get("Institution Name") or "").strip()
            if not name:
                continue
            city = (row.get("City/Region") or "").strip()
            rows_out.append(
                {
                    "institution_name": name,
                    "district": dname,
                    "latitude": lat,
                    "longitude": lng,
                    "city_region_osm": city,
                    "distance_km_to_centroid": round(dkm, 2),
                }
            )

    random.shuffle(rows_out)
    rows_out = rows_out[: args.limit]

    args.output.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "institution_name",
        "district",
        "latitude",
        "longitude",
        "city_region_osm",
        "distance_km_to_centroid",
        "assigned_by",
    ]
    with args.output.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows_out:
            w.writerow(
                {
                    "institution_name": r["institution_name"],
                    "district": r["district"],
                    "latitude": r["latitude"],
                    "longitude": r["longitude"],
                    "city_region_osm": r["city_region_osm"],
                    "distance_km_to_centroid": r["distance_km_to_centroid"],
                    "assigned_by": "nearest_centroid_v1",
                }
            )

    print(f"Wrote {len(rows_out)} rows to {args.output}")


if __name__ == "__main__":
    main()
