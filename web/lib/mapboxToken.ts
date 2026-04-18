/** Server / Route Handler — reads live env (not build-inlined). */
export function getPublicMapboxToken(): string {
  const raw =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.MAPBOX_TOKEN ||
    "";
  return raw.replace(/^\uFEFF/, "").trim();
}
