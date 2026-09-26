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
            I&apos;m a self-taught artist, still learning and finding my own way with two very
            different forms of art. I enjoy taking my time with pencil and charcoal, especially when
            drawing portraits and still life.
          </p>
          <p>
            With acrylic, I&apos;m more relaxed and free. I like playing with colour, light, weather
            and memories &mdash; fields after rain, quiet harbours at dusk, or the warmth of a market
            in the evening.
          </p>
          <p>
            Most of my paintings begin with a simple sketch or idea and often take me somewhere
            unexpected. I&apos;m still learning and enjoy seeing where the process leads.
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
