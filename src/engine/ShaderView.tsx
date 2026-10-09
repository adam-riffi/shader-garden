import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { GLSL3, RawShaderMaterial, Vector2 } from "three";
import fullscreenVertex from "../shaders/common/fullscreen.vert.glsl";
import type { Clock } from "./clock";
import { SimulationPlane, type SimulationSpec } from "./SimulationPlane";
import { bindUniforms, createUniforms, type UniformInput } from "./uniforms";

export interface ShaderViewProps {
  /** GLSL ES 3.00 fragment source without `#version`; three prepends it. */
  fragmentShader: string;
  vertexShader?: string;
  /** Shader-specific uniforms. `uTime` and `uResolution` are always provided. */
  uniforms?: Record<string, UniformInput>;
  clock: Clock;
  className?: string;
  /** Capture mode: device pixel ratio 1 and render only when something changes. */
  capture?: boolean;
  /** Capture mode: called once the first frame is drawn and the GPU has finished it. */
  onCaptureReady?: () => void;
  /** Present for stateful shaders: `fragmentShader` is then the display pass. */
  simulation?: SimulationSpec | undefined;
  /** Changing it reseeds a simulation. */
  reseed?: number;
}

/** Renders a fragment shader over the whole canvas, with time taken from `clock`. */
export function ShaderView({
  className,
  capture = false,
  onCaptureReady,
  simulation,
  reseed = 0,
  ...plane
}: ShaderViewProps) {
  return (
    <Canvas
      className={className}
      dpr={capture ? 1 : [1, 2]}
      frameloop={capture ? "demand" : "always"}
      gl={{ antialias: false }}
    >
      {simulation ? (
        <SimulationPlane {...plane} simulation={simulation} reseed={reseed} capture={capture} />
      ) : (
        <ShaderPlane {...plane} />
      )}
      {capture && <CaptureFrame onReady={onCaptureReady} />}
    </Canvas>
  );
}

function ShaderPlane({
  fragmentShader,
  vertexShader = fullscreenVertex,
  uniforms = {},
  clock,
}: Omit<ShaderViewProps, "className" | "capture" | "onCaptureReady" | "simulation" | "reseed">) {
  // Values are bound in place below; only a new shader or a new set of uniform names rebuilds.
  const names = Object.keys(uniforms).sort().join();
  // biome-ignore lint/correctness/useExhaustiveDependencies: `names` stands in for `uniforms`.
  const material = useMemo(
    () =>
      new RawShaderMaterial({
        glslVersion: GLSL3,
        vertexShader,
        fragmentShader,
        uniforms: createUniforms({ ...uniforms, uTime: clock.time, uResolution: [1, 1] }),
      }),
    [vertexShader, fragmentShader, names],
  );
  const size = useMemo(() => new Vector2(), []);

  useEffect(() => bindUniforms(material.uniforms, uniforms), [material, uniforms]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ gl }, delta) => {
    clock.tick(delta);
    gl.getDrawingBufferSize(size);
    bindUniforms(material.uniforms, { uTime: clock.time, uResolution: [size.x, size.y] });
  });

  return (
    <mesh frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/**
 * Draws the frame itself (priority 1 replaces R3F's own render), then reads one pixel back: that
 * blocks until the GPU has finished, so a slow software-rendered frame is complete when announced.
 */
function CaptureFrame({ onReady }: { onReady: (() => void) | undefined }) {
  const announced = useRef(false);
  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera);
    if (announced.current) return;
    const context = gl.getContext();
    context.readPixels(0, 0, 1, 1, context.RGBA, context.UNSIGNED_BYTE, new Uint8Array(4));
    announced.current = true;
    onReady?.();
  }, 1);
  return null;
}
