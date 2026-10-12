import { NextResponse } from "next/server";

import { getProductSuggestions } from "@/lib/catalog/suggestions";
import { getRequestDb } from "@/lib/db/request";
import { checkRateLimit } from "@/lib/rate-limit/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 60, windowMs: 60 * 1000 };
const MAX_QUERY_LENGTH = 80;

/** GET /api/search/suggest?q=nano → up to 6 product suggestions. */
export async function GET(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  if (!checkRateLimit(`suggest:${ip}`, RATE_LIMIT).allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const query = new URL(request.url).searchParams.get("q") ?? "";

  try {
    const db = await getRequestDb();
    const suggestions = await getProductSuggestions(db, query.slice(0, MAX_QUERY_LENGTH));
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[search] suggestion query failed:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
