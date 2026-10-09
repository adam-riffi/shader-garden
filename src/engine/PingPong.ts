import {
  type Camera,
  HalfFloatType,
  Mesh,
  type Object3D,
  OrthographicCamera,
  PlaneGeometry,
  type RawShaderMaterial,
  RepeatWrapping,
  Scene,
  type Texture,
  WebGLRenderTarget,
} from "three";
import { UniformBindingError } from "./uniforms";

/** The renderer calls a simulation pass needs; a WebGLRenderer provides them. */
export interface PassRenderer {
  getRenderTarget(): WebGLRenderTarget | null;
  setRenderTarget(target: WebGLRenderTarget | null): void;
  render(scene: Object3D, camera: Camera): void;
}

/** Simulation textures stay within this size (DESIGN.md section 13). */
const MAX_SIZE = 512;

/**
 * Two half-float (RGBA16F) render targets for a stateful simulation. Each step draws `material`
 * over a full-screen quad into `write` while it samples the previous state from `read`, then the
 * two swap, so the latest state is always `read`.
 */
export class PingPong {
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad = new PlaneGeometry(2, 2);
  private readonly mesh: Mesh;

  constructor(
    private readonly material: RawShaderMaterial,
    size = MAX_SIZE,
    /** Sampler uniform through which `material` reads the previous state. */
    private readonly stateUniform = "uState",
  ) {
    if (size > MAX_SIZE) throw new RangeError(`Simulation size ${size} exceeds ${MAX_SIZE}`);
    if (!material.uniforms[stateUniform]) {
      throw new UniformBindingError(`Simulation material lacks the "${stateUniform}" uniform`);
    }
    const target = () =>
      new WebGLRenderTarget(size, size, {
        type: HalfFloatType,
        depthBuffer: false,
        // A torus: patterns and dye leaving one edge come back on the other, with no border artifacts.
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
      });
    this.read = target();
    this.write = target();
    this.mesh = new Mesh(this.quad, material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  /** The latest simulation state. */
  get texture(): Texture {
    return this.read.texture;
  }

  swap(): void {
    [this.read, this.write] = [this.write, this.read];
  }

  /** Runs `steps` simulation passes, then restores the renderer's previous target. */
  step(renderer: PassRenderer, steps = 1): void {
    const previous = renderer.getRenderTarget();
    const state = this.material.uniforms[this.stateUniform];
    for (let i = 0; i < steps; i++) {
      if (state) state.value = this.read.texture;
      renderer.setRenderTarget(this.write);
      renderer.render(this.scene, this.camera);
      this.swap();
    }
    renderer.setRenderTarget(previous);
  }

  /** Draws `seed` (an initial state) into both targets, then restores the renderer's target. */
  fill(renderer: PassRenderer, seed: RawShaderMaterial): void {
    const previous = renderer.getRenderTarget();
    this.mesh.material = seed;
    for (const target of [this.read, this.write]) {
      renderer.setRenderTarget(target);
      renderer.render(this.scene, this.camera);
    }
    this.mesh.material = this.material;
    renderer.setRenderTarget(previous);
  }

  /** Frees the targets and the quad; the material belongs to the caller. */
  dispose(): void {
    this.read.dispose();
    this.write.dispose();
    this.quad.dispose();
  }
}
