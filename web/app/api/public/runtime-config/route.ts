import { NextResponse } from "next/server";
import { getPublicRuntimePayload } from "@/lib/publicRuntimePayload";

export const dynamic = "force-dynamic";

/**
 * Live env for the browser when `next build` had no access to secrets / bindable URLs.
 * NEXT_PUBLIC_* is normally baked at build time; this route reads the same vars at request time.
 */
export async function GET() {
  return NextResponse.json(getPublicRuntimePayload());
}
