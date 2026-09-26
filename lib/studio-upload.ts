import { randomUUID } from "crypto";
import { getSupabase, ARTWORKS_BUCKET } from "@/lib/supabase";

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "artwork"
  );
}

/** Uploads an image to the "artworks" Supabase Storage bucket and returns its
 * public URL. Nothing is written to local disk. */
export async function uploadArtworkImage(file: File, titleForSlug: string): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    throw new Error("Only JPEG, PNG, WebP or GIF images are allowed.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image is larger than 20MB.");
  }

  const path = `${slugify(titleForSlug)}-${randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await getSupabase()
    .storage.from(ARTWORKS_BUCKET)
    .upload(path, buffer, { contentType: file.type });
  if (error) throw new Error(error.message);

  const { data } = getSupabase().storage.from(ARTWORKS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Deletes an artwork image from Supabase Storage. No-ops for URLs that
 * aren't in our bucket (e.g. old external links from seed data). */
export async function removeArtworkImage(url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${ARTWORKS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await getSupabase().storage.from(ARTWORKS_BUCKET).remove([path]);
}
