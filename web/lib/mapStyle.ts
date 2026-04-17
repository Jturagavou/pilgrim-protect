/** Default Mapbox style when no custom Studio style is configured. */
export const DEFAULT_MAPBOX_STYLE = "mapbox://styles/mapbox/light-v11";

/**
 * Map style URL: set `NEXT_PUBLIC_MAPBOX_STYLE` to your Mapbox Studio style
 * (`mapbox://styles/<your_id>`) for Pilgrim palette parity.
 */
export function getMapboxStyle(): string {
  const custom = process.env.NEXT_PUBLIC_MAPBOX_STYLE?.trim();
  return custom || DEFAULT_MAPBOX_STYLE;
}
