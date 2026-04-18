/** Created with Cursor — AI-assisted. */

import { getMapData } from "@/lib/map.server";
import MapExperience from "@/components/map/MapExperience";
import { getPublicMapboxToken } from "@/lib/mapboxToken";

/** Always read Mapbox + map data at request time so .env.local is applied (avoids empty token from SSG). */
export const dynamic = "force-dynamic";

export default async function MapPage() {
  const { schools, districts } = await getMapData();
  /** Read on the server so the token is always applied (client chunks can miss inlined NEXT_PUBLIC_*). */
  const mapboxToken = getPublicMapboxToken();
  return (
    <MapExperience schools={schools} districts={districts} mapboxToken={mapboxToken} />
  );
}
