import { describe, expect, it } from "vitest";
import { findShader, gallery } from "../../src/shaders/registry";

describe("Terrain", () => {
  const terrain = findShader("terrain");

  it("is in the gallery", () => {
    expect(gallery.map((entry) => entry.meta.name)).toContain("terrain");
  });

  it("exposes the warp slider from the demo script and an octave count", () => {
    const params = Object.fromEntries((terrain?.meta.params ?? []).map((p) => [p.name, p]));
    expect(params.warp).toMatchObject({ type: "float", min: 0 });
    expect(params.octaves).toMatchObject({ type: "int", min: 1, max: 8 });
  });

  it("ships its presets", () => {
    expect(Object.keys(terrain?.meta.presets ?? {})).toEqual(["Highlands", "Dunes", "Archipelago"]);
  });
});
