import { Pencil, Trash2 } from "lucide-react";
import type { Artwork } from "@/lib/artworks";

interface ArtworkCardProps {
  artwork: Artwork;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ArtworkCard({ artwork, onEdit, onDelete }: ArtworkCardProps) {
  return (
    <figure className="group flex flex-col">
      <div className="overflow-hidden rounded-md border border-border bg-muted">
        <div className="aspect-[3/4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artwork.images[0]}
            alt={artwork.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-sm">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </figure>
  );
}
