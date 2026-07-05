import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createTicketSchema } from "@/lib/validation/ticket";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// Spam controls for the open public form.
const RATE_LIMIT = 5; // submissions...
const RATE_WINDOW_MS = 60_000; // ...per minute, per IP.

/**
 * POST /api/tickets — create a new feedback ticket from the public form.
 * Validated with the same Zod schema the form uses, so client and server agree.
 * Protected against abuse with a honeypot field and per-IP rate limiting.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: a hidden field real users never see. If it's filled, it's a bot —
  // pretend everything succeeded so the bot doesn't learn it was caught.
  if (
    body &&
    typeof body === "object" &&
    typeof (body as Record<string, unknown>).website === "string" &&
    (body as Record<string, unknown>).website !== ""
  ) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Rate limit per IP to stop floods.
  const ip = getClientIp(request);
  const limit = rateLimit(`tickets:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error:
          "You're sending feedback too quickly. Please wait a moment and try again.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { screenshotUrls, submitterEmail, ...rest } = parsed.data;

  try {
    const ticket = await prisma.ticket.create({
      data: {
        ...rest,
        // Store a blank email as null so "no email" is unambiguous in the DB.
        submitterEmail: submitterEmail ? submitterEmail : null,
        attachments: screenshotUrls?.length
          ? { create: screenshotUrls.map((url) => ({ url })) }
          : undefined,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: ticket.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json(
      { error: "We couldn't save your feedback. Please try again." },
      { status: 500 },
    );
  }
}
