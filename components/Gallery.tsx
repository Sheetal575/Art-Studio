"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Artwork, Category } from "@/lib/artworks";

// Most visitors never open the lightbox — its zoom/pan/pinch logic and DOM
// portal have no reason to be in the initial page bundle. Loaded on demand,
// only once a piece is actually clicked.
const Lightbox = dynamic(() => import("@/components/Lightbox"), { ssr: false });

type Filter = "all" | Category;

const TABS: { filter: Filter; label: string }[] = [
  { filter: "all", label: "All" },
  { filter: "graphite", label: "Pencil & Charcoal" },
  { filter: "acrylic", label: "Acrylic" },
];

const INITIAL_COUNT = 9;
const LOAD_STEP = 10;

export default function Gallery({ artworks }: { artworks: Artwork[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState(INITIAL_COUNT);
  const [lightbox, setLightbox] = useState<{ order: number[]; pos: number } | null>(null);

  const visibleIndexes = useMemo(
    () => artworks.map((_, i) => i).filter((i) => filter === "all" || artworks[i].category === filter),
    [artworks, filter]
  );

  const shownIndexes = visibleIndexes.slice(0, shown);
  const remaining = visibleIndexes.length - shownIndexes.length;
  const canShowLess = shown > INITIAL_COUNT;

  const selectFilter = (next: Filter) => {
    setFilter(next);
    setShown(INITIAL_COUNT);
  };

  const showLess = () => {
    setShown(INITIAL_COUNT);
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: artworks.length, graphite: 0, acrylic: 0 };
    artworks.forEach((a) => {
      c[a.category] += 1;
    });
    return c;
  }, [artworks]);

  const openLightbox = (index: number) => {
    const order = shownIndexes;
    const pos = Math.max(0, order.indexOf(index));
    setLightbox({ order, pos });
  };

  return (
    <>
      <section className="section" id="work">
        <div className="wrap">
          <div className="section-head">
            <h2 className="section-title">Work</h2>
            <div className="tabs" role="tablist" aria-label="Filter by medium">
              {TABS.map((t) => (
                <button
                  key={t.filter}
                  className="tab"
                  role="tab"
                  aria-selected={filter === t.filter}
                  onClick={() => selectFilter(t.filter)}
                >
                  {t.label}
                  <span className="count">{counts[t.filter]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid" id="grid">
            {shownIndexes.map((idx) => {
              const a = artworks[idx];
              return (
                <figure className={`tile ${a.category}`} key={a.id}>
                  <button aria-label={`View ${a.title}`} onClick={() => openLightbox(idx)}>
                    <div className="frame">
                      <div className="art">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.images[0]} alt={`${a.title}, ${a.medium}`} loading="lazy" />
                      </div>
                    </div>
                  </button>
                </figure>
              );
            })}
          </div>
          {(remaining > 0 || canShowLess) && (
            <div className="load-more-wrap">
              {remaining > 0 && (
                <button className="load-more" onClick={() => setShown((s) => s + LOAD_STEP)}>
                  Load more
                  <span className="load-more-count">{remaining} left</span>
                </button>
              )}
              {canShowLess && (
                <button className="show-less" onClick={showLess}>
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <Lightbox
          artworks={artworks}
          initialOrder={lightbox.order}
          initialPos={lightbox.pos}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
