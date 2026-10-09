import { useMemo, useState } from "react";
import { createClock } from "../engine/clock";
import { ShaderView } from "../engine/ShaderView";
import { defaults, toUniforms } from "../params/schema";
import { meta } from "../shaders/test/meta";
import testShader from "../shaders/test/test.frag.glsl";

/** Placeholder until the gallery (M4): shows that the engine renders on the deployed site. */
export default function EngineDemo() {
  const [clock] = useState(() => createClock());
  const uniforms = useMemo(() => toUniforms(meta, defaults(meta), 1), []);
  return (
    <div style={{ height: "60vh" }}>
      <ShaderView fragmentShader={testShader} uniforms={uniforms} clock={clock} />
    </div>
  );
}
