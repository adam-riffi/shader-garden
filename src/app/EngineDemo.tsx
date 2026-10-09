import { useState } from "react";
import { createClock } from "../engine/clock";
import { ShaderView } from "../engine/ShaderView";
import testShader from "../shaders/test/test.frag.glsl";

/** Placeholder until the gallery (M4): shows that the engine renders on the deployed site. */
export default function EngineDemo() {
  const [clock] = useState(() => createClock());
  return (
    <div style={{ height: "60vh" }}>
      <ShaderView fragmentShader={testShader} clock={clock} />
    </div>
  );
}
