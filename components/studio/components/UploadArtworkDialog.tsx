"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { Artwork } from "@/lib/artworks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ArtworkFormFields from "@/components/studio/components/ArtworkFormFields";
import ImageDropzone from "@/components/studio/components/ImageDropzone";
import { EMPTY_ARTWORK_FORM } from "@/components/studio/constants/artwork-form";
import { artworkFormToFormData } from "@/components/studio/utils/artwork-form";

interface UploadArtworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (artwork: Artwork) => void;
}

export default function UploadArtworkDialog({ open, onOpenChange, onCreated }: UploadArtworkDialogProps) {
  const [form, setForm] = useState(EMPTY_ARTWORK_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setForm(EMPTY_ARTWORK_FORM);
    setFile(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose an image to upload.");
      return;
    }
    setUploading(true);
    try {
      const body = artworkFormToFormData(form, file);
      const res = await fetch("/api/studio/artworks", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      onCreated(data as Artwork);
      reset();
      onOpenChange(false);
      toast.success("Artwork added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">New artwork</DialogTitle>
          <DialogDescription>This appears on your public site immediately.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <ArtworkFormFields idPrefix="new" form={form} onChange={setForm} />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-image">Image</Label>
            <ImageDropzone id="new-image" file={file} onChange={setFile} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Adding..." : "Add artwork"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
