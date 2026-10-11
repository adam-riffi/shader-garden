import { useEffect, useState } from "react";
import { LiveGallery } from "../ui/LiveGallery";

export default function Home() {
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setPaused(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return (
    <div className="gallery-page">
      <section className="gallery-intro" aria-labelledby="garden-intro">
        <p className="eyebrow">An evolving collection of generative studies</p>
        <h2 id="garden-intro">
          A little mathematics.
          <br />A little <em>wild.</em>
        </h2>
        <div className="intro-note">
          <span className="live-dot" /> Grown in real time.
          <p>
            Six living experiments in light, pattern and motion.
            <br />
            Step inside. Change a variable. See what grows.
          </p>
        </div>
      </section>
      <div className="collection-heading">
        <h2>
          Selected specimens <span> / 01—06</span>
        </h2>
        <button type="button" onClick={() => setPaused((value) => !value)}>
          {paused ? "Play previews" : "Pause previews"}
        </button>
      </div>
      <LiveGallery paused={paused} />
      <footer className="gallery-footer">
        <span>Nature, approximated.</span>
        <span>Hand-written GLSL · Rendered on your GPU</span>
      </footer>
    </div>
  );
}
