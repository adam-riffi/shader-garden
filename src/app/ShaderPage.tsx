import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useStore } from "zustand";
import { captureTime } from "../engine/capture";
import { createClock } from "../engine/clock";
import { ShaderView } from "../engine/ShaderView";
import { toUniforms } from "../params/schema";
import { createParamsStore } from "../params/store";
import { syncToUrl, withQuery } from "../params/urlSync";
import { findShader, type ShaderEntry } from "../shaders/registry";
import { ParamControls } from "../ui/ParamControls";

const NOTICES = {
  "unknown-version": "This link comes from a newer version of Shader Garden; showing the defaults.",
  invalid: "This link could not be read; showing the defaults.",
} as const;

/** `/s/:name`: one shader with its controls, or a frozen full-viewport frame in capture mode. */
export default function ShaderPage() {
  const { name = "" } = useParams();
  const entry = findShader(name);
  if (!entry) {
    return (
      <p>
        There is no shader called {name}. <Link to="/">Back to the gallery</Link>
      </p>
    );
  }
  return <ShaderScreen key={entry.meta.name} entry={entry} />;
}

function ShaderScreen({ entry }: { entry: ShaderEntry }) {
  const { meta, fragment, simulation } = entry;
  const [reseed, setReseed] = useState(0);
  const [frozenAt] = useState(() => captureTime(window.location.search));
  const capture = frozenAt !== undefined;
  const [clock] = useState(() => createClock(capture ? { time: frozenAt, paused: true } : {}));
  const [store] = useState(() => createParamsStore(meta, window.location.search));
  // Layout effect: subscribed before the controls can be used, so no early change is missed.
  useLayoutEffect(() => {
    if (capture) return;
    return syncToUrl(store, (query) =>
      window.history.replaceState(window.history.state, "", withQuery(window.location.href, query)),
    );
  }, [store, capture]);
  const values = useStore(store, (s) => s.values);
  const seed = useStore(store, (s) => s.seed);
  const status = useStore(store, (s) => s.status);
  const uniforms = useMemo(() => toUniforms(meta, values, seed), [meta, values, seed]);
  // Capture mode announces its finished frame on <html data-capture-ready> for scripts and tests.
  useEffect(() => () => void delete document.documentElement.dataset.captureReady, []);

  if (capture) {
    return (
      <div style={{ position: "fixed", inset: 0 }}>
        <ShaderView
          fragmentShader={fragment}
          uniforms={uniforms}
          clock={clock}
          simulation={simulation}
          capture
          onCaptureReady={() => {
            document.documentElement.dataset.captureReady = "true";
          }}
        />
      </div>
    );
  }
  const notice = status === "unknown-version" || status === "invalid" ? NOTICES[status] : null;
  return (
    <>
      <h2>{meta.title}</h2>
      {notice && <p role="status">{notice}</p>}
      <div style={{ height: "60vh" }}>
        <ShaderView
          fragmentShader={fragment}
          uniforms={uniforms}
          clock={clock}
          simulation={simulation}
          reseed={reseed}
        />
      </div>
      {simulation && (
        <button type="button" onClick={() => setReseed((count) => count + 1)}>
          Seed
        </button>
      )}
      <ParamControls store={store} />
    </>
  );
}
