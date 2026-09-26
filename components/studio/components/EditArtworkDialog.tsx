"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { Artwork } from "@/lib/artworks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ArtworkFormFields from "@/components/studio/components/ArtworkFormFields";
import ImageDropzone from "@/components/studio/components/ImageDropzone";
import { EMPTY_ARTWORK_FORM } from "@/components/studio/constants/artwork-form";
import { artworkFormToFormData, parseSize } from "@/components/studio/utils/artwork-form";

interface EditArtworkDialogProps {
  artwork: Artwork | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: (artwork: Artwork) => void;
}

export default function EditArtworkDialog({ artwork, onOpenChange, onUpdated }: EditArtworkDialogProps) {
  const [form, setForm] = useState(EMPTY_ARTWORK_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed the form whenever a different artwork is opened for editing.
  useEffect(() => {
    if (!artwork) return;
    const { width, height } = parseSize(artwork.size);
    setForm({
      title: artwork.title,
      category: artwork.category,
      medium: artwork.medium,
      width,
      height,
      year: artwork.year,
      description: artwork.description ?? "",
    });
    setFile(null);
  }, [artwork]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!artwork) return;
    setSaving(true);
    try {
      const body = artworkFormToFormData(form, file);
      const res = await fetch(`/api/studio/artworks/${artwork.id}`, { method: "PATCH", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      onUpdated(data as Artwork);
      onOpenChange(false);
      toast.success("Artwork updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!artwork} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">Edit artwork</DialogTitle>
          <DialogDescription>Update the details or replace the image.</DialogDescription>
        </DialogHeader>
        {artwork && (
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <ArtworkFormFields idPrefix="edit" form={form} onChange={setForm} />
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-image">Image</Label>
              <ImageDropzone id="edit-image" file={file} onChange={setFile} existingSrc={artwork.images[0]} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
