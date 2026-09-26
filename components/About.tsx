import { PORTRAIT_SRC } from "@/lib/artworks";

export default function About() {
  return (
    <section className="section" id="about">
      <div className="wrap about-grid">
        <div className="portrait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PORTRAIT_SRC} alt="Portrait of the artist" width={898} height={1144} />
        </div>
        <div className="about-body">
          <h2 className="section-title">About</h2>
          <p>
            I&apos;m a self-taught artist working in two very different languages. With pencil and
            charcoal I slow down: portraits, hands, folded cloth, the quiet weight of ordinary
            objects, built up layer by layer over many hours.
          </p>
          <p>
            Acrylic is where I let go. Colour, weather and memory: fields after rain, harbours at
            dusk, the heat of a market in the evening. Most of my paintings begin as small
            sketches and end somewhere I didn&apos;t plan.
          </p>
          <dl className="facts">
            <div>
              <dt>Based in</dt>
              <dd>Makrana, India</dd>
            </div>
            <div>
              <dt>Working since</dt>
              <dd>2024</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
