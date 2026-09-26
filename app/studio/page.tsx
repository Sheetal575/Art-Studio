import { getArtworks } from "@/lib/artworks";
import StudioDashboard from "@/components/studio/StudioDashboard";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const artworks = await getArtworks();
  return <StudioDashboard initialArtworks={artworks} />;
}
