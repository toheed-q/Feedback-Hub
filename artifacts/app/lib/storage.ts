import { randomUUID } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_SCREENSHOTS_BUCKET ?? "screenshots";

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isStorageConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

/**
 * Uploads image bytes to the public screenshots bucket via the Supabase Storage
 * REST API (no SDK) and returns the public URL. The service key stays server-side.
 */
export async function uploadScreenshot(
  data: ArrayBuffer,
  contentType: string,
): Promise<{ url: string; path: string }> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Storage is not configured.");
  }

  const ext = EXT_BY_TYPE[contentType] ?? "bin";
  const path = `tickets/${randomUUID()}.${ext}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "Content-Type": contentType,
        "cache-control": "3600",
      },
      body: new Uint8Array(data),
    },
  );

  if (!res.ok) {
    throw new Error(`Storage upload failed (${res.status}): ${await res.text()}`);
  }

  return {
    url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`,
    path,
  };
}
