import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rowToArtwork, type ArtworkRow, type Category } from "@/lib/artworks";
import { removeArtworkImage, uploadArtworkImage } from "@/lib/studio-upload";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabase();

  const { data: current, error: fetchError } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", params.id)
    .single();
  if (fetchError || !current) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }
  const currentRow = current as ArtworkRow;

  const form = await request.formData();
  const title = String(form.get("title") ?? currentRow.title).trim();
  const category = String(form.get("category") ?? currentRow.category);
  const medium = String(form.get("medium") ?? currentRow.medium).trim();
  const size = String(form.get("size") ?? currentRow.size ?? "").trim();
  const year = String(form.get("year") ?? currentRow.year).trim();
  const description = String(form.get("description") ?? currentRow.description ?? "").trim();

  if (!title || !medium || !year) {
    return NextResponse.json({ error: "Title, medium and year are required." }, { status: 400 });
  }
  if (category !== "graphite" && category !== "acrylic") {
    return NextResponse.json({ error: "Category must be graphite or acrylic." }, { status: 400 });
  }

  let images = currentRow.images;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    let newUrl: string;
    try {
      newUrl = await uploadArtworkImage(file, title);
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
    }
    await Promise.all(currentRow.images.map(removeArtworkImage));
    images = [newUrl];
  }

  const { data: updated, error: updateError } = await supabase
    .from("artworks")
    .update({
      title,
      category: category as Category,
      medium,
      size: size || null,
      year,
      description: description || null,
      images,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(rowToArtwork(updated as ArtworkRow));
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabase();

  const { data: current, error: fetchError } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", params.id)
    .single();
  if (fetchError || !current) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }
  const currentRow = current as ArtworkRow;

  const { error: deleteError } = await supabase.from("artworks").delete().eq("id", params.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await Promise.all(currentRow.images.map(removeArtworkImage));

  return NextResponse.json({ ok: true });
}
