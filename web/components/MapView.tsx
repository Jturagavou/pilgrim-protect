"use client";

import { useRef, useCallback, useState } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapRef,
  type MarkerEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { pinFill } from "@/lib/mapLabels";
import type { LegacyStatus, MapFeature } from "@/lib/types";
import { getMapboxStyle } from "@/lib/mapStyle";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAP_STYLE = getMapboxStyle();

// Marker color by legacy spray status (school profile / older data)
function markerColor(status: LegacyStatus | string): string {
  switch (status) {
    case "active":
      return "#22c55e"; // green
    case "pending":
      return "#f97316"; // orange
    case "overdue":
      return "#ef4444"; // red
    default:
      return "#9ca3af";
  }
}

interface MapViewProps {
  features?: MapFeature[];
  initialCenter?: [number, number];
  initialZoom?: number;
  onSchoolClick?: (feature: MapFeature) => void;
  className?: string;
  interactive?: boolean;
  compact?: boolean;
}

export default function MapView({
  features = [],
  initialCenter = [32.29, 2.77],
  initialZoom = 7,
  onSchoolClick,
  className = "",
  interactive = true,
  compact = false,
}: MapViewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [popupInfo, setPopupInfo] = useState<MapFeature | null>(null);

  const handleMarkerClick = useCallback(
    (feature: MapFeature) => {
      const [lng, lat] = feature.geometry.coordinates;
      setPopupInfo(feature);
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 10, duration: 1200 });
      onSchoolClick?.(feature);
    },
    [onSchoolClick]
  );

  return (
    <div className={`relative ${className}`}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: initialCenter[0],
          latitude: initialCenter[1],
          zoom: initialZoom,
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        interactive={interactive}
        attributionControl={!compact}
      >
        {interactive && <NavigationControl position="top-right" />}

        {features.map((f) => {
          const [lng, lat] = f.geometry.coordinates;
          const p = f.properties;
          return (
            <Marker
              key={p._id}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={(e: MarkerEvent<MouseEvent>) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(f);
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
                style={{
                  backgroundColor: p.gapState
                    ? pinFill(p)
                    : markerColor(p.status as LegacyStatus),
                }}
                title={p.name}
              />
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            longitude={popupInfo.geometry.coordinates[0]}
            latitude={popupInfo.geometry.coordinates[1]}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            className="pilgrim-popup"
          >
            <div className="p-1 min-w-[200px]">
              <h3 className="font-semibold text-gray-900 text-sm">
                {popupInfo.properties.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {popupInfo.properties.district} District
              </p>
              <div className="flex gap-3 mt-2 text-xs text-gray-600">
                <span>{popupInfo.properties.studentCount} students</span>
                <span>{popupInfo.properties.totalRooms} rooms</span>
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href={`/schools/${popupInfo.properties._id}`}
                  className="flex-1 text-center text-xs font-medium bg-emerald-600 text-white rounded px-2 py-1 hover:bg-emerald-700 transition-colors"
                >
                  View Profile
                </a>
                <a
                  href={`/donate?school=${popupInfo.properties._id}`}
                  className="flex-1 text-center text-xs font-medium border border-emerald-600 text-emerald-600 rounded px-2 py-1 hover:bg-emerald-50 transition-colors"
                >
                  Sponsor
                </a>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
