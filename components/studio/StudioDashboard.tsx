"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Artwork } from "@/lib/artworks";
import StudioHeader from "@/components/studio/components/StudioHeader";
import ArtworkGrid from "@/components/studio/components/ArtworkGrid";
import UploadArtworkDialog from "@/components/studio/components/UploadArtworkDialog";
import EditArtworkDialog from "@/components/studio/components/EditArtworkDialog";
import DeleteArtworkDialog from "@/components/studio/components/DeleteArtworkDialog";

export default function StudioDashboard({ initialArtworks }: { initialArtworks: Artwork[] }) {
  const router = useRouter();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<Artwork | null>(null);
  const [deleting, setDeleting] = useState<Artwork | null>(null);

  const logout = async () => {
    await fetch("/api/studio/logout", { method: "POST" });
    router.push("/studio/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      <StudioHeader onAddClick={() => setUploadOpen(true)} onLogout={logout} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <ArtworkGrid
          artworks={artworks}
          onAddClick={() => setUploadOpen(true)}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </main>

      <UploadArtworkDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onCreated={(artwork) => setArtworks((prev) => [artwork, ...prev])}
      />

      <EditArtworkDialog
        artwork={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onUpdated={(updated) => setArtworks((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))}
      />

      <DeleteArtworkDialog
        artwork={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={(id) => setArtworks((prev) => prev.filter((a) => a.id !== id))}
      />
    </div>
  );
}
