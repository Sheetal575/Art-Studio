"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Artwork } from "@/lib/artworks";

const MIN = 1;
const MAX = 4.5;

interface LightboxProps {
  artworks: Artwork[];
  initialOrder: number[];
  initialPos: number;
  onClose: () => void;
}

export default function Lightbox({ artworks, initialOrder, initialPos, onClose }: LightboxProps) {
  const [order] = useState(initialOrder);
  const [pos, setPos] = useState(initialPos);
  const [open, setOpen] = useState(false);
  const [fading, setFading] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  // Phone only: details start collapsed behind a chevron; the placard slides
  // up as a bottom sheet when opened. Ignored by the desktop layout.
  const [infoOpen, setInfoOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const movedRef = useRef(0);
  const pinchDistRef = useRef(0);
  const pinchZoomRef = useRef(1);
  const lastTapRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const artwork = artworks[order[pos]];

  const applyTransform = useCallback((animate: boolean) => {
    const img = imgRef.current;
    if (!img) return;
    img.style.transition = animate ? "" : "none";
    img.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`;
    img.classList.toggle("zoomed", zoomRef.current > 1.01);
  }, []);

  const resetZoom = useCallback(() => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    applyTransform(false);
  }, [applyTransform]);

  const clampPan = useCallback(() => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (!img || !stage) return;
    const iw = img.offsetWidth * zoomRef.current;
    const ih = img.offsetHeight * zoomRef.current;
    const maxX = Math.max(0, (iw - stage.clientWidth) / 2);
    const maxY = Math.max(0, (ih - stage.clientHeight) / 2);
    panRef.current.x = Math.max(-maxX, Math.min(maxX, panRef.current.x));
    panRef.current.y = Math.max(-maxY, Math.min(maxY, panRef.current.y));
  }, []);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, target: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      target = Math.max(MIN, Math.min(MAX, target));
      const r = stage.getBoundingClientRect();
      const px = clientX - (r.left + r.width / 2);
      const py = clientY - (r.top + r.height / 2);
      const ratio = target / zoomRef.current;
      panRef.current.x = panRef.current.x + (1 - ratio) * (px - panRef.current.x);
      panRef.current.y = panRef.current.y + (1 - ratio) * (py - panRef.current.y);
      zoomRef.current = target;
      clampPan();
      applyTransform(true);
    },
    [applyTransform, clampPan]
  );

  const step = useCallback((d: number) => {
    setPos((p) => (p + d + order.length) % order.length);
  }, [order.length]);

  // Detect touch device, mount animation, focus + scroll lock
  useEffect(() => {
    setIsTouch(matchMedia("(hover: none)").matches);
    lastFocusRef.current = document.activeElement as HTMLElement;
    document.body.classList.add("locked");
    const raf = requestAnimationFrame(() => setOpen(true));
    closeBtnRef.current?.focus();
    return () => {
      document.body.classList.remove("locked");
      cancelAnimationFrame(raf);
      lastFocusRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fade/reset on artwork change
  useEffect(() => {
    resetZoom();
    setInfoOpen(false);
    setFading(true);
    const t = setTimeout(() => setFading(false), 120);
    return () => clearTimeout(t);
  }, [pos, resetZoom]);

  const handleClose = useCallback(() => {
    setOpen(false);
    resetZoom();
    setTimeout(onClose, 250);
  }, [onClose, resetZoom]);

  // Keyboard navigation + focus trap
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        // Only visible buttons participate — the phone-only toggles are
        // display:none on desktop and must not become trap anchors.
        const f = Array.from(dialogRef.current.querySelectorAll("button")).filter(
          (b) => (b as HTMLElement).offsetParent !== null
        ) as HTMLElement[];
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleClose, step]);

  // Non-passive wheel zoom
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, zoomRef.current * (e.deltaY < 0 ? 1.18 : 1 / 1.18));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const onPointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = 0;
    if (pointersRef.current.size === 1) {
      dragStartRef.current = { x: e.clientX, y: e.clientY, panX: panRef.current.x, panY: panRef.current.y };
      if (zoomRef.current > 1) imgRef.current?.classList.add("dragging");
    } else if (pointersRef.current.size === 2) {
      const p = [...pointersRef.current.values()];
      pinchDistRef.current = dist(p[0], p[1]);
      pinchZoomRef.current = zoomRef.current;
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = [...pointersRef.current.values()];
    if (pointersRef.current.size >= 2) {
      const d = dist(p[0], p[1]);
      const m = mid(p[0], p[1]);
      zoomAt(m.x, m.y, pinchZoomRef.current * (d / pinchDistRef.current));
    } else if (pointersRef.current.size === 1 && dragStartRef.current && zoomRef.current > 1) {
      panRef.current.x = dragStartRef.current.panX + (e.clientX - dragStartRef.current.x);
      panRef.current.y = dragStartRef.current.panY + (e.clientY - dragStartRef.current.y);
      movedRef.current += Math.abs(e.movementX) + Math.abs(e.movementY);
      clampPan();
      applyTransform(false);
    } else if (dragStartRef.current) {
      movedRef.current += Math.abs(e.clientX - dragStartRef.current.x) + Math.abs(e.clientY - dragStartRef.current.y);
    }
  };

  const endPointer = (e: React.PointerEvent<HTMLImageElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size === 0) {
      imgRef.current?.classList.remove("dragging");
      if (movedRef.current < 6) {
        const toggle = () => {
          if (zoomRef.current > 1) resetZoom();
          else zoomAt(e.clientX, e.clientY, 2.6);
        };
        if (e.pointerType === "touch") {
          const now = Date.now();
          if (now - lastTapRef.current < 320) {
            lastTapRef.current = 0;
            toggle();
          } else {
            lastTapRef.current = now;
          }
        } else {
          toggle();
        }
      } else if (zoomRef.current > 1) {
        applyTransform(true);
      }
      dragStartRef.current = null;
    } else if (pointersRef.current.size === 1) {
      const p = [...pointersRef.current.values()][0];
      dragStartRef.current = { x: p.x, y: p.y, panX: panRef.current.x, panY: panRef.current.y };
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (zoomRef.current > 1 || e.changedTouches.length > 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  };


  const tickPct = order.length > 1 ? (pos / (order.length - 1)) * 100 : 0;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`lb${open ? " open" : ""}${infoOpen ? " info-open" : ""}`}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lbTitle"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target === dialogRef.current || target.classList.contains("lb-stage")) {
          if (infoOpen) setInfoOpen(false);
          else handleClose();
        }
      }}
    >
      <button className="lb-btn lb-close" ref={closeBtnRef} aria-label="Close" onClick={handleClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <button className="lb-btn lb-prev" aria-label="Previous artwork" onClick={() => step(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button className="lb-btn lb-next" aria-label="Next artwork" onClick={() => step(1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <figure
        className="lb-stage"
        ref={stageRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id="lbImg"
          ref={imgRef}
          className={fading ? "fading" : ""}
          src={artwork.images[0]}
          alt={`${artwork.title}, ${artwork.medium}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        />
      </figure>
      <button
        className="lb-info-toggle"
        aria-label="Show details"
        aria-expanded={infoOpen}
        onClick={() => setInfoOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
      <aside className="lb-placard">
        <button
          className="lb-info-close"
          aria-label="Hide details"
          onClick={() => setInfoOpen(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <p className="lb-count">
          <span id="lbCount">
            {pos + 1} / {order.length}
          </span>
          <span className="lb-progress">
            <span id="lbTick" style={{ left: `calc(${tickPct}% - 3px)` }} />
          </span>
        </p>
        <h3 className="lb-title" id="lbTitle">
          {artwork.title}
        </h3>
        <dl className="lb-details">
          <dt>Medium</dt>
          <dd>{artwork.medium}</dd>
          {artwork.size && (
            <>
              <dt>Size</dt>
              <dd>{artwork.size}</dd>
            </>
          )}
          <dt>Year</dt>
          <dd>{artwork.year}</dd>
        </dl>
        {artwork.description && <p className="lb-desc">{artwork.description}</p>}
      </aside>
    </div>,
    document.body
  );
}
