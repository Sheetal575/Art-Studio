import type { Category } from "@/lib/artworks";

export type ArtworkForm = {
  title: string;
  category: Category;
  medium: string;
  width: string;
  height: string;
  year: string;
  description: string;
};
