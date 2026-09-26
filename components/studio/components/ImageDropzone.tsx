"use client";

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  id: string;
  file: File | null;
  onChange: (file: File | null) => void;
  /** Existing artwork image, shown as the preview until a new file is chosen. */
  existingSrc?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageDropzone({ id, file, onChange, existingSrc }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displaySrc = previewUrl ?? existingSrc ?? null;

  const openPicker = () => inputRef.current?.click();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const picked = e.dataTransfer.files?.[0];
    if (picked) onChange(picked);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  const clear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) onChange(picked);
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-md border border-dashed border-input p-3 transition-colors hover:border-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          dragging && "border-primary bg-accent/60"
        )}
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displaySrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">
            {file ? file.name : existingSrc ? "Replace image" : "Click to upload or drag and drop"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {file ? formatFileSize(file.size) : "PNG, JPG, WebP or GIF"}
          </p>
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            aria-label="Remove selected image"
            className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
