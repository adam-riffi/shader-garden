import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { GLSL3, RawShaderMaterial, Vector2 } from "three";
import fullscreenVertex from "../shaders/common/fullscreen.vert.glsl";
import type { Clock } from "./clock";
import { PingPong } from "./PingPong";
import { bindUniforms, createUniforms, type UniformInput } from "./uniforms";

/** A stateful shader: a seed pass, a step pass run on the GPU each frame, and a display pass. */
export interface SimulationSpec {
  step: string;
  seed: string;
  stepsPerFrame: number;
  size: number;
}

/** Frames per second assumed when a capture replays `t` seconds of simulation. */
const CAPTURE_FPS = 60;

interface SimulationPlaneProps {
  fragmentShader: string;
  vertexShader?: string;
  uniforms?: Record<string, UniformInput>;
  clock: Clock;
  simulation: SimulationSpec;
  /** Changing it reseeds the state (the "Seed" button). */
  reseed?: number;
  capture?: boolean;
}

/**
 * Seeds a PingPong state, advances it `stepsPerFrame` times per frame while the clock runs, and
 * draws it with the display shader. A capture instead replays round(t * 60) frames of steps at
 * once, so the frozen frame depends on the step count, never on wall time.
 */
export function SimulationPlane({
  fragmentShader,
  vertexShader = fullscreenVertex,
  uniforms = {},
  clock,
  simulation: { step, seed, stepsPerFrame, size },
  reseed = 0,
  capture = false,
}: SimulationPlaneProps) {
  const names = Object.keys(uniforms).sort().join();
  // biome-ignore lint/correctness/useExhaustiveDependencies: `names` stands in for `uniforms`, bound in place below.
  const materials = useMemo(() => {
    const make = (fragment: string) =>
      new RawShaderMaterial({
        glslVersion: GLSL3,
        vertexShader,
        fragmentShader: fragment,
        uniforms: {
          ...createUniforms({ ...uniforms, uTime: clock.time, uResolution: [1, 1], uReseed: 0 }),
          uState: { value: null },
          uTexel: { value: new Vector2(1 / size, 1 / size) },
        },
      });
    return { display: make(fragmentShader), step: make(step), seed: make(seed) };
  }, [vertexShader, fragmentShader, step, seed, size, names]);
  const pingPong = useMemo(() => new PingPong(materials.step, size), [materials, size]);
  const resolution = useMemo(() => new Vector2(), []);
  const needsSeed = useRef(true);
  const replayed = useRef(false);

  useEffect(
    () => () => {
      pingPong.dispose();
      for (const material of Object.values(materials)) material.dispose();
    },
    [materials, pingPong],
  );

  useEffect(() => {
    for (const material of Object.values(materials)) bindUniforms(material.uniforms, uniforms);
  }, [materials, uniforms]);

  // A new seed value (Randomize, a shared link) or the Seed button restarts the simulation.
  const seedValue = uniforms.uSeed ?? 0;
  useEffect(() => {
    for (const material of Object.values(materials)) {
      bindUniforms(material.uniforms, { uReseed: reseed, uSeed: seedValue });
    }
    needsSeed.current = true;
    replayed.current = false;
  }, [materials, reseed, seedValue]);

  useFrame(({ gl }, delta) => {
    clock.tick(delta);
    if (needsSeed.current) {
      pingPong.fill(gl, materials.seed);
      needsSeed.current = false;
    }
    if (capture) {
      if (!replayed.current) {
        pingPong.step(gl, Math.round(clock.time * CAPTURE_FPS) * stepsPerFrame);
        replayed.current = true;
      }
    } else if (!clock.paused) {
      pingPong.step(gl, stepsPerFrame);
    }
    gl.getDrawingBufferSize(resolution);
    bindUniforms(materials.display.uniforms, {
      uTime: clock.time,
      uResolution: [resolution.x, resolution.y],
    });
    const state = materials.display.uniforms.uState;
    if (state) state.value = pingPong.texture;
  });

  return (
    <mesh frustumCulled={false} material={materials.display}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
