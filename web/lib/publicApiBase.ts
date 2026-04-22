const DEFAULT_API_BASE_URL = "http://localhost:8080/api/v1";

export function normalizePublicApiBaseUrl(url: string | undefined | null): string {
  const trimmed = url?.trim().replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_API_BASE_URL;

  // DigitalOcean's component PUBLIC_URL already includes the /api route.
  return trimmed.replace(/\/api\/api\/v1$/, "/api/v1");
}

export function resolvePublicApiBaseUrl(): string {
  return normalizePublicApiBaseUrl(
    process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
  );
}
