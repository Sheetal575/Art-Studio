import type { ArtworkForm } from "@/components/studio/types/artwork-form";

/** The site stores size as a single "W × H cm" string; the form collects two
 * plain numbers instead and formats/parses this automatically, so the person
 * filling it in never has to type the × symbol or unit themselves. */
export function formatSize(width: string, height: string): string {
  const w = width.trim();
  const h = height.trim();
  if (!w || !h) return "";
  return `${w} × ${h} cm`;
}

export function parseSize(size: string | undefined): { width: string; height: string } {
  const match = size?.match(/(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/);
  if (!match) return { width: "", height: "" };
  return { width: match[1], height: match[2] };
}

/** Builds the multipart body every create/update request sends, from a form's
 * current fields plus optionally a new image file. */
export function artworkFormToFormData(form: ArtworkForm, image?: File | null): FormData {
  const body = new FormData();
  body.append("title", form.title);
  body.append("category", form.category);
  body.append("medium", form.medium);
  body.append("size", formatSize(form.width, form.height));
  body.append("year", form.year);
  body.append("description", form.description);
  if (image) body.append("image", image);
  return body;
}
