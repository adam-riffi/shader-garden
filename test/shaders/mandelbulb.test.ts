import { describe, expect, it } from "vitest";
import { findShader, gallery } from "../../src/shaders/registry";

describe("Mandelbulb", () => {
  const bulb = findShader("mandelbulb");

  it("is in the gallery", () => {
    expect(gallery.map((entry) => entry.meta.name)).toContain("mandelbulb");
  });

  it("raises z to a power between 2 and 12 (DESIGN.md section 6)", () => {
    const power = bulb?.meta.params.find((p) => p.name === "power");
    expect(power).toMatchObject({ type: "float", min: 2, max: 12, default: 8 });
  });

  it("ships its presets, Classic at power 8", () => {
    expect(Object.keys(bulb?.meta.presets ?? {})).toEqual(["Classic", "Bloom", "Spiky"]);
    expect(bulb?.meta.presets.Classic?.power).toBe(8);
  });
});
