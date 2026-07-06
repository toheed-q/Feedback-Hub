import { NextResponse } from "next/server";

import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_BYTES,
  isStorageConfigured,
  uploadScreenshot,
} from "@/lib/storage";

/**
 * POST /api/uploads — accepts a single image (multipart), validates type/size,
 * stores it in Supabase Storage, and returns its public URL.
 */
export async function POST(request: Request) {
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Image uploads aren't available right now." },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`uploads:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPG, WEBP, or GIF images are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "Each image must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  try {
    const { url } = await uploadScreenshot(await file.arrayBuffer(), file.type);
    return NextResponse.json({ url, fileName: file.name }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
