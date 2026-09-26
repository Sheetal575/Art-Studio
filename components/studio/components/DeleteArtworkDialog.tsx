"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Artwork } from "@/lib/artworks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteArtworkDialogProps {
  artwork: Artwork | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export default function DeleteArtworkDialog({ artwork, onOpenChange, onDeleted }: DeleteArtworkDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!artwork) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/studio/artworks/${artwork.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed.");
      }
      onDeleted(artwork.id);
      onOpenChange(false);
      toast.success("Artwork deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!artwork} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">Delete artwork</DialogTitle>
          <DialogDescription>
            This removes &ldquo;{artwork?.title}&rdquo; from your site and deletes its image file. This can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
