import { describe, expect, it } from "vitest";
import { findShader, gallery } from "../../src/shaders/registry";

describe("Aurora", () => {
  const aurora = findShader("aurora");

  it("is in the gallery", () => {
    expect(gallery.map((entry) => entry.meta.name)).toContain("aurora");
  });

  it("layers between one and six ribbons", () => {
    const layers = aurora?.meta.params.find((p) => p.name === "layers");
    expect(layers).toMatchObject({ type: "int", min: 1, max: 6 });
  });

  it("ships its presets", () => {
    expect(Object.keys(aurora?.meta.presets ?? {})).toEqual(["Polar", "Solar storm"]);
  });
});
