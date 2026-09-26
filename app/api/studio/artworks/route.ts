import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rowToArtwork, type ArtworkRow, type Category } from "@/lib/artworks";
import { uploadArtworkImage } from "@/lib/studio-upload";

export async function POST(request: Request) {
  const form = await request.formData();

  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const medium = String(form.get("medium") ?? "").trim();
  const size = String(form.get("size") ?? "").trim();
  const year = String(form.get("year") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const file = form.get("image");

  if (!title || !medium || !year) {
    return NextResponse.json({ error: "Title, medium and year are required." }, { status: 400 });
  }
  if (category !== "graphite" && category !== "acrylic") {
    return NextResponse.json({ error: "Category must be graphite or acrylic." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "An image file is required." }, { status: 400 });
  }

  let imageUrl: string;
  try {
    imageUrl = await uploadArtworkImage(file, title);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("artworks")
    .insert({
      title,
      category: category as Category,
      medium,
      size: size || null,
      year,
      description: description || null,
      images: [imageUrl],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToArtwork(data as ArtworkRow), { status: 201 });
}
