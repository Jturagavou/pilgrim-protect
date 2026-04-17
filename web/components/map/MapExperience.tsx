/** Created with Cursor — AI-assisted. */

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapRef,
  type MarkerEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { pilgrimSpring } from "@/lib/motion";
import { pinFill } from "@/lib/mapLabels";
import type { MapFeature } from "@/lib/types";
import DistrictFilter from "./DistrictFilter";
import SchoolPopup from "./SchoolPopup";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAP_STYLE = "mapbox://styles/mapbox/light-v11";

interface MapExperienceProps {
  schools: MapFeature[];
  districts: string[];
}

export default function MapExperience({
  schools,
  districts,
}: MapExperienceProps) {
  const mapRef = useRef<MapRef | null>(null);
  const reduceMotion = useReducedMotion();
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<MapFeature | null>(null);

  const districtOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of schools) {
      const d = f.properties.district;
      counts[d] = (counts[d] ?? 0) + 1;
    }
    return districts.map((name) => ({
      name,
      count: counts[name] ?? 0,
    }));
  }, [schools, districts]);

  const filtered = useMemo(() => {
    if (!activeDistrict) return schools;
    return schools.filter((f) => f.properties.district === activeDistrict);
  }, [schools, activeDistrict]);

  const { helpedN, strugglingN, totalScoped } = useMemo(() => {
    let helped = 0;
    let struggling = 0;
    const pool = activeDistrict
      ? schools.filter((f) => f.properties.district === activeDistrict)
      : schools;
    for (const f of pool) {
      if (f.properties.gapState === "helped") helped += 1;
      else if (f.properties.gapState === "struggling") struggling += 1;
    }
    return {
      helpedN: helped,
      strugglingN: struggling,
      totalScoped: pool.length,
    };
  }, [schools, activeDistrict]);

  const flyTo = useCallback((f: MapFeature) => {
    const [lng, lat] = f.geometry.coordinates;
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 11,
      duration: reduceMotion ? 0 : 1000,
    });
    setPopupInfo(f);
  }, [reduceMotion]);

  const handleMarkerClick = useCallback(
    (f: MapFeature) => (e: MarkerEvent<MouseEvent>) => {
      e.originalEvent.stopPropagation();
      flyTo(f);
    },
    [flyTo]
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] min-h-0 bg-background">
      <aside className="flex flex-col shrink-0 border-b border-border lg:border-b-0 lg:border-r lg:border-border lg:w-96 max-h-[48vh] lg:max-h-none overflow-hidden bg-card">
        <div className="p-4 space-y-4 shrink-0">
          <div>
            <h1 className="font-display text-2xl text-ink tracking-tight">
              Schools we&apos;re protecting
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every dot is a school in the Pilgrim Protect program.
            </p>
          </div>

          <DistrictFilter
            districts={districtOptions}
            active={activeDistrict}
            onChange={setActiveDistrict}
          />

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full border-2 border-white shadow shrink-0"
                style={{ backgroundColor: "var(--color-state-helped)" }}
              />
              <span className="text-ink">Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full border-2 border-white shadow shrink-0"
                style={{ backgroundColor: "var(--color-state-struggling)" }}
              />
              <span className="text-ink">Needs funding</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-ink">{helpedN}</span>
            {" of "}
            <span className="font-medium text-ink">{totalScoped}</span>
            {" schools protected · "}
            <span className="font-medium text-ink">{strugglingN}</span>
            {" still need funding"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 min-h-0">
          {filtered.map((f) => {
            const p = f.properties;
            const helped = p.gapState === "helped";
            return (
              <button
                key={p._id}
                type="button"
                onClick={() => flyTo(f)}
                className="w-full text-left rounded-xl border border-border bg-paper-soft hover:bg-paper-depth transition-colors p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-sm font-semibold text-ink leading-tight">
                      {p.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.district}
                      {p.subCounty ? ` · ${p.subCounty}` : ""}
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                    style={{
                      backgroundColor: helped
                        ? "var(--color-state-helped)"
                        : "var(--color-state-struggling)",
                    }}
                  >
                    {helped ? "Protected" : "Needs funding"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 min-h-[280px] lg:min-h-0 relative">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 32.29,
            latitude: 1.37,
            zoom: 6,
          }}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          style={{ width: "100%", height: "100%" }}
          attributionControl
        >
          <NavigationControl position="top-right" />

          <AnimatePresence mode="popLayout">
            {filtered.map((f, i) => {
              const [lng, lat] = f.geometry.coordinates;
              const p = f.properties;
              const delay = reduceMotion ? 0 : Math.min(i, 12) * 0.08;
              return (
                <Marker
                  key={p._id}
                  longitude={lng}
                  latitude={lat}
                  anchor="center"
                  onClick={handleMarkerClick(f)}
                >
                  <motion.div
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 0.8 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, scale: 0.8 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { ...pilgrimSpring, delay }
                    }
                    className="rounded-full border-2 border-white shadow-md cursor-pointer"
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: pinFill(p),
                    }}
                    title={p.name}
                  />
                </Marker>
              );
            })}
          </AnimatePresence>

          {popupInfo && (
            <Popup
              longitude={popupInfo.geometry.coordinates[0]}
              latitude={popupInfo.geometry.coordinates[1]}
              anchor="bottom"
              onClose={() => setPopupInfo(null)}
              closeOnClick={false}
              maxWidth="320px"
            >
              <SchoolPopup feature={popupInfo} />
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}
