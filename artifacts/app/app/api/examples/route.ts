import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createExampleSchema = z.object({
  name: z.string().min(1).max(200),
});

export async function GET() {
  try {
    const examples = await prisma.example.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(examples);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createExampleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const example = await prisma.example.create({
      data: { name: parsed.data.name },
    });

    return NextResponse.json(example, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database error" },
      { status: 503 },
    );
  }
}
