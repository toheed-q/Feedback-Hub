import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createTicketSchema } from "@/lib/validation/ticket";

/**
 * POST /api/tickets — create a new feedback ticket from the public form.
 * Validated with the same Zod schema the form uses, so client and server agree.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
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
