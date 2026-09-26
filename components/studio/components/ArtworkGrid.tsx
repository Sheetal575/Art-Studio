"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Plus } from "lucide-react";
import type { Artwork, Category } from "@/lib/artworks";
import { Button } from "@/components/ui/button";
import ArtworkCard from "@/components/studio/components/ArtworkCard";

type Filter = "all" | Category;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "graphite", label: "Pencil & Charcoal" },
  { value: "acrylic", label: "Acrylic" },
];

interface ArtworkGridProps {
  artworks: Artwork[];
  onAddClick: () => void;
  onEdit: (artwork: Artwork) => void;
  onDelete: (artwork: Artwork) => void;
}

export default function ArtworkGrid({ artworks, onAddClick, onEdit, onDelete }: ArtworkGridProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: artworks.length, graphite: 0, acrylic: 0 };
    artworks.forEach((a) => {
      c[a.category] += 1;
    });
    return c;
  }, [artworks]);

  const visible = useMemo(
    () => (filter === "all" ? artworks : artworks.filter((a) => a.category === filter)),
    [artworks, filter]
  );

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl leading-tight">Your work</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {counts.all} {counts.all === 1 ? "piece" : "pieces"} · shown live on your site
          </p>
        </div>
        <div className="flex flex-wrap gap-1 border-b border-border sm:border-0" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`relative px-3 py-2 text-sm transition-colors ${
                filter === f.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs text-muted-foreground">{counts[f.value]}</span>
              {filter === f.value && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
          <p className="mt-4 font-display text-xl">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first artwork to see it on your site.</p>
          <Button className="mt-6" onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            Add artwork
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
          {visible.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onEdit={() => onEdit(artwork)}
              onDelete={() => onDelete(artwork)}
            />
          ))}
        </div>
      )}
    </>
  );
}
