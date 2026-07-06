import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { Status } from "@/lib/domain/tickets";

// Trigram score above which two titles are considered "similar enough" to surface.
const SIMILARITY_THRESHOLD = 0.3;

type SimilarTicket = { title: string; status: Status };

/**
 * GET /api/tickets/similar?q=... — returns up to 5 open tickets whose titles are
 * similar to the query (Postgres trigram / pg_trgm). Used by the public form to
 * warn a submitter about likely duplicates before they post. Returns title +
 * status only — never submitter details.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 4) {
    return NextResponse.json([]);
  }

  // Light rate limit so the endpoint can't be used to enumerate all titles.
  const ip = getClientIp(request);
  const limit = rateLimit(`similar:${ip}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json([], { status: 429 });
  }

  try {
    // Search tickets of every status: an open match means "already tracked", while a
    // Completed/Closed match tells the submitter it was fixed or already decided (and
    // helps them flag a possible regression). The status badge conveys which it is.
    const rows = await prisma.$queryRaw<SimilarTicket[]>`
      SELECT title, status
      FROM "Ticket"
      WHERE word_similarity(${q}, title) > ${SIMILARITY_THRESHOLD}
      ORDER BY word_similarity(${q}, title) DESC
      LIMIT 5
    `;
    return NextResponse.json(rows);
  } catch (error) {
    // Duplicate hints are a nicety — never let them break the form.
    console.error("Similar-tickets lookup failed:", error);
    return NextResponse.json([]);
  }
}
