import { NextResponse } from "next/server";
import { getPublicRuntimePayload } from "@/lib/publicRuntimePayload";

export const dynamic = "force-dynamic";

/** @deprecated Prefer GET /api/public/runtime-config — kept for older clients. */
export async function GET() {
  const { mapboxToken } = getPublicRuntimePayload();
  return NextResponse.json({ token: mapboxToken });
}
