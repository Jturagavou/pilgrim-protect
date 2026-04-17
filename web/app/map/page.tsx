/** Created with Cursor — AI-assisted. */

import { getMapData } from "@/lib/map.server";
import MapExperience from "@/components/map/MapExperience";

export const revalidate = 60;

export default async function MapPage() {
  const { schools, districts } = await getMapData();
  return <MapExperience schools={schools} districts={districts} />;
}
