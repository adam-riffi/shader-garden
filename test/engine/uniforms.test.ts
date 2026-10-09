import { Vector2, Vector3, Vector4 } from "three";
import { describe, expect, it } from "vitest";
import { bindUniforms, createUniforms, UniformBindingError } from "../../src/engine/uniforms";

describe("createUniforms", () => {
  it("wraps scalars and maps tuples to three vectors", () => {
    const u = createUniforms({ uWarp: 0.5, uOn: true, uA: [1, 2], uB: [1, 2, 3], uC: [1, 2, 3, 4] });
    expect(u.uWarp?.value).toBe(0.5);
    expect(u.uOn?.value).toBe(true);
    expect(u.uA?.value).toEqual(new Vector2(1, 2));
    expect(u.uB?.value).toEqual(new Vector3(1, 2, 3));
    expect(u.uC?.value).toEqual(new Vector4(1, 2, 3, 4));
  });
});

describe("bindUniforms", () => {
  it("updates values in place, keeping the uniform and vector objects the material holds", () => {
    const u = createUniforms({ uWarp: 0, uTint: [0, 0, 0] });
    const warp = u.uWarp;
    const tint = u.uTint?.value;
    bindUniforms(u, { uWarp: 0.8, uTint: [0.1, 0.2, 0.3] });
    expect(u.uWarp).toBe(warp);
    expect(u.uWarp?.value).toBe(0.8);
    expect(u.uTint?.value).toBe(tint);
    expect(u.uTint?.value).toEqual(new Vector3(0.1, 0.2, 0.3));
  });

  it("leaves uniforms that are not in the update untouched", () => {
    const u = createUniforms({ uA: 1, uB: 2 });
    bindUniforms(u, { uA: 3 });
    expect(u.uB?.value).toBe(2);
  });

  it("rejects a uniform the shader does not declare", () => {
    const u = createUniforms({ uA: 1 });
    expect(() => bindUniforms(u, { uTypo: 1 })).toThrow(UniformBindingError);
  });

  it("rejects a value whose shape differs from the declared one", () => {
    const u = createUniforms({ uScalar: 1, uVec: [0, 0] });
    expect(() => bindUniforms(u, { uScalar: [1, 2] })).toThrow(UniformBindingError);
    expect(() => bindUniforms(u, { uVec: [1, 2, 3] })).toThrow(UniformBindingError);
    expect(() => bindUniforms(u, { uVec: 1 })).toThrow(UniformBindingError);
  });
});
