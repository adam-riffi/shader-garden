import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { GLSL3, RawShaderMaterial, Vector2 } from "three";
import fullscreenVertex from "../shaders/common/fullscreen.vert.glsl";
import type { Clock } from "./clock";
import { bindUniforms, createUniforms, type UniformInput } from "./uniforms";

export interface ShaderViewProps {
  /** GLSL ES 3.00 fragment source without `#version`; three prepends it. */
  fragmentShader: string;
  vertexShader?: string;
  /** Shader-specific uniforms. `uTime` and `uResolution` are always provided. */
  uniforms?: Record<string, UniformInput>;
  clock: Clock;
  className?: string;
}

/** Renders a fragment shader over the whole canvas, with time taken from `clock`. */
export function ShaderView({ className, ...plane }: ShaderViewProps) {
  return (
    <Canvas className={className} dpr={[1, 2]} gl={{ antialias: false }}>
      <ShaderPlane {...plane} />
    </Canvas>
  );
}

function ShaderPlane({
  fragmentShader,
  vertexShader = fullscreenVertex,
  uniforms = {},
  clock,
}: Omit<ShaderViewProps, "className">) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: values are bound in place below; rebuilding per change would recompile the program.
  const material = useMemo(
    () =>
      new RawShaderMaterial({
        glslVersion: GLSL3,
        vertexShader,
        fragmentShader,
        uniforms: createUniforms({ ...uniforms, uTime: clock.time, uResolution: [1, 1] }),
      }),
    [vertexShader, fragmentShader],
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
