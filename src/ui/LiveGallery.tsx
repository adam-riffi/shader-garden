import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  GLSL3,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import { PingPong } from "../engine/PingPong";
import { bindUniforms, createUniforms } from "../engine/uniforms";
import { defaults, toUniforms } from "../params/schema";
import vertexShader from "../shaders/common/fullscreen.vert.glsl";
import { gallery, type ShaderEntry } from "../shaders/registry";

export const specimenNotes: Record<string, { technique: string; description: string }> = {
  terrain: {
    technique: "Domain-warped noise",
    description: "Imagined topographies. Endless places.",
  },
  mandelbulb: {
    technique: "Fractal raymarching",
    description: "An entire world inside an equation.",
  },
  bloom: { technique: "Reaction–diffusion", description: "Simple chemistry. Unexpected life." },
  ink: { technique: "Curl-noise advection", description: "Colour finding its own way." },
  aurora: { technique: "Layered noise ribbons", description: "A small piece of the northern sky." },
  moire: { technique: "Wave interference", description: "Order, meeting a little interference." },
};

/** GPU resources for a tile, all owned by the gallery's single offscreen renderer. */
function createTile(entry: ShaderEntry, renderer: WebGLRenderer) {
  const { meta, simulation } = entry;
  const make = (fragmentShader: string) =>
    new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      glslVersion: GLSL3,
      uniforms: {
        ...createUniforms({
          ...toUniforms(meta, defaults(meta), 1),
          uTime: 0,
          uResolution: [256, 256],
          uReseed: 0,
          uSimTime: 0,
          uStepDt: 1 / (15 * (simulation?.stepsPerFrame ?? 1)),
        }),
        uState: { value: null },
        uTexel: { value: new Vector2(1 / 256, 1 / 256) },
      },
    });
  const display = make(entry.fragment);
  const step = simulation ? make(simulation.step) : undefined;
  const seed = simulation ? make(simulation.seed) : undefined;
  const pingPong = step ? new PingPong(step, 256) : undefined;
  const geometry = new PlaneGeometry(2, 2);
  const scene = new Scene();
  const mesh = new Mesh(geometry, display);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  if (pingPong && seed) pingPong.fill(renderer, seed);
  let time = 0;
  let steps = 0;
  return {
    draw(delta: number) {
      time += delta;
      if (pingPong && step && simulation) {
        for (let i = 0; i < simulation.stepsPerFrame; i++) {
          bindUniforms(step.uniforms, { uSimTime: steps++ / (15 * simulation.stepsPerFrame) });
          pingPong.step(renderer);
        }
        const state = display.uniforms.uState;
        if (state) state.value = pingPong.texture;
      }
      bindUniforms(display.uniforms, { uTime: time });
      renderer.render(scene, camera);
    },
    dispose() {
      pingPong?.dispose();
      geometry.dispose();
      for (const material of [display, step, seed]) material?.dispose();
    },
  };
}

/** Visible 2D canvases receive frames synchronously from one detached 256 px WebGL canvas. */
export function LiveGallery({ paused }: { paused: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const isPaused = useRef(paused);
  const [error, setError] = useState(false);
  useEffect(() => {
    isPaused.current = paused;
  }, [paused]);
  useEffect(() => {
    const canvases = [...(root.current?.querySelectorAll<HTMLCanvasElement>("canvas") ?? [])];
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: false });
      renderer.setSize(256, 256, false);
    } catch {
      setError(true);
      return;
    }
    const resources = new Map<HTMLCanvasElement, ReturnType<typeof createTile>>();
    const visible = new Set<HTMLCanvasElement>();
    const drawn = new Set<HTMLCanvasElement>();
    let frame = 0;
    let last = 0;
    let stopped = false;
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      setError(true);
    };
    const lost = (event: Event) => {
      event.preventDefault();
      stop();
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const canvas = entry.target as HTMLCanvasElement;
        canvas.dataset.visible = String(entry.isIntersecting);
        if (entry.isIntersecting) visible.add(canvas);
        else visible.delete(canvas);
      }
    });
    for (const canvas of canvases) observer.observe(canvas);
    const render = (now: number) => {
      if (stopped) return;
      frame = requestAnimationFrame(render);
      if (now - last < 1000 / 15) return;
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (document.hidden) return;
      try {
        for (const canvas of visible) {
          if (isPaused.current && drawn.has(canvas)) continue;
          let resource = resources.get(canvas);
          if (!resource) {
            const entry = gallery.find(({ meta }) => meta.name === canvas.dataset.shader);
            if (!entry) continue;
            resource = createTile(entry, renderer);
            resources.set(canvas, resource);
          }
          resource.draw(delta);
          canvas.getContext("2d")?.drawImage(renderer.domElement, 0, 0);
          drawn.add(canvas);
          canvas.dataset.ready = "true";
        }
      } catch {
        stop();
      }
    };
    frame = requestAnimationFrame(render);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      for (const resource of resources.values()) resource.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <>
      {error && (
        <p role="status">
          Live previews are unavailable on this device. You can still explore each specimen.{" "}
          <button type="button" onClick={() => window.location.reload()}>
            Reload previews
          </button>
        </p>
      )}
      <div className="gallery-grid" ref={root}>
        {gallery.map(({ meta }, index) => (
          <Link
            className="specimen"
            key={meta.name}
            to={`/s/${meta.name}`}
            aria-label={`Explore ${meta.title}`}
          >
            <div className="specimen-art">
              <canvas
                width={256}
                height={256}
                data-shader={meta.name}
                tabIndex={-1}
                aria-hidden="true"
              />
              <span className="specimen-enter" aria-hidden="true">
                Explore ↗
              </span>
            </div>
            <div className="specimen-caption">
              <span className="specimen-number">0{index + 1}</span>
              <h3>{meta.title}</h3>
              <span aria-hidden="true">↗</span>
            </div>
            <p className="specimen-technique">{specimenNotes[meta.name]?.technique}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
