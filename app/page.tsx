import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getArtworks } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const artworks = await getArtworks();
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Gallery artworks={artworks} />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
