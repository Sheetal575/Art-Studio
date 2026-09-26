import { getSupabase } from "@/lib/supabase";

export type Category = "graphite" | "acrylic";

export interface Artwork {
  id: string;
  category: Category;
  title: string;
  medium: string;
  size?: string;
  year: string;
  description?: string;
  /** images[0] is the cover shown in the grid and lightbox. Only one image
   * is used today, but the site and studio both treat it as a list so a
   * future multi-image view per artwork needs no schema/type change. */
  images: string[];
}

export interface ArtworkRow {
  id: string;
  category: Category;
  title: string;
  medium: string;
  size: string | null;
  year: string;
  description: string | null;
  images: string[];
}

export function rowToArtwork(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    medium: row.medium,
    size: row.size ?? undefined,
    year: row.year,
    description: row.description ?? undefined,
    images: row.images,
  };
}

export async function getArtworks(): Promise<Artwork[]> {
  const { data, error } = await getSupabase()
    .from("artworks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ArtworkRow[]).map(rowToArtwork);
}

/* Add a portrait image URL here for the About section. */
export const PORTRAIT_SRC = "/artsworks/potrait.jpeg";
