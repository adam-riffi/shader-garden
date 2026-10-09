import { useLayoutEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { createClock } from "../engine/clock";
import { ShaderView } from "../engine/ShaderView";
import { toUniforms } from "../params/schema";
import { createParamsStore } from "../params/store";
import { syncToUrl } from "../params/urlSync";
import { meta } from "../shaders/test/meta";
import testShader from "../shaders/test/test.frag.glsl";
import { ParamControls } from "../ui/ParamControls";

const NOTICES = {
  "unknown-version": "This link comes from a newer version of Shader Garden; showing the defaults.",
  invalid: "This link could not be read; showing the defaults.",
} as const;

/** Placeholder until the gallery (M4): the engine and params on the test shader. */
export default function EngineDemo() {
  const [clock] = useState(() => createClock());
  const [store] = useState(() => createParamsStore(meta, window.location.search));
  // Layout effect: subscribed before the controls can be used, so no early change is missed.
  useLayoutEffect(
    () =>
      syncToUrl(store, (query) =>
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}?${query}`,
        ),
      ),
    [store],
  );
  const values = useStore(store, (s) => s.values);
  const seed = useStore(store, (s) => s.seed);
  const status = useStore(store, (s) => s.status);
  const uniforms = useMemo(() => toUniforms(meta, values, seed), [values, seed]);
  const notice = status === "unknown-version" || status === "invalid" ? NOTICES[status] : null;

  return (
    <>
      {notice && <p role="status">{notice}</p>}
      <div style={{ height: "60vh" }}>
        <ShaderView fragmentShader={testShader} uniforms={uniforms} clock={clock} />
      </div>
      <ParamControls store={store} />
    </>
  );
}
