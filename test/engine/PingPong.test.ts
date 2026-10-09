import {
  type Camera,
  HalfFloatType,
  type Object3D,
  RawShaderMaterial,
  type Texture,
  type WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { describe, expect, expectTypeOf, it } from "vitest";
import { type PassRenderer, PingPong } from "../../src/engine/PingPong";
import { UniformBindingError } from "../../src/engine/uniforms";

function simMaterial() {
  return new RawShaderMaterial({ uniforms: { uState: { value: null } } });
}

/** Records which target each pass drew into and which texture it read. */
function recordingRenderer(material: RawShaderMaterial) {
  const outer = new WebGLRenderTarget(1, 1);
  let target: WebGLRenderTarget | null = outer;
  const passes: { into: WebGLRenderTarget | null; read: Texture }[] = [];
  const renderer: PassRenderer = {
    getRenderTarget: () => target,
    setRenderTarget: (next) => {
      target = next;
    },
    render: (_scene: Object3D, _camera: Camera) => {
      passes.push({ into: target, read: material.uniforms.uState?.value });
    },
  };
  return { renderer, passes, outer, current: () => target };
}

describe("PingPong", () => {
  it("allocates two distinct half-float targets of the given size", () => {
    const pp = new PingPong(simMaterial(), 256);
    expect(pp.read).not.toBe(pp.write);
    for (const target of [pp.read, pp.write]) {
      expect(target.width).toBe(256);
      expect(target.height).toBe(256);
      expect(target.texture.type).toBe(HalfFloatType);
    }
  });

  it("swaps the read and write targets", () => {
    const pp = new PingPong(simMaterial());
    const [a, b] = [pp.read, pp.write];
    pp.swap();
    expect([pp.read, pp.write]).toEqual([b, a]);
  });

  it("feeds each pass the previous state and writes into the other target", () => {
    const material = simMaterial();
    const pp = new PingPong(material);
    const [a, b] = [pp.read, pp.write];
    const { renderer, passes } = recordingRenderer(material);

    pp.step(renderer, 3);

    expect(passes).toEqual([
      { into: b, read: a.texture },
      { into: a, read: b.texture },
      { into: b, read: a.texture },
    ]);
    expect(pp.texture).toBe(b.texture);
  });

  it("restores the render target that was active before stepping", () => {
    const material = simMaterial();
    const { renderer, outer, current } = recordingRenderer(material);
    new PingPong(material).step(renderer);
    expect(current()).toBe(outer);
  });

  it("refuses textures above the 512 px budget", () => {
    expect(() => new PingPong(simMaterial(), 1024)).toThrow(RangeError);
  });

  it("requires the material to declare the state uniform", () => {
    const material = new RawShaderMaterial({ uniforms: {} });
    expect(() => new PingPong(material)).toThrow(UniformBindingError);
  });

  it("can be driven by a real WebGLRenderer", () => {
    expectTypeOf<WebGLRenderer>().toExtend<PassRenderer>();
  });

  it("releases both targets on dispose", () => {
    const pp = new PingPong(simMaterial());
    const disposed: unknown[] = [];
    for (const target of [pp.read, pp.write]) {
      target.addEventListener("dispose", () => disposed.push(target));
    }
    pp.dispose();
    expect(disposed).toHaveLength(2);
  });
});
