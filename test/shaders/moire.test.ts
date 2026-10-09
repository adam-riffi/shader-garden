import { describe, expect, it } from "vitest";
import { findShader, gallery } from "../../src/shaders/registry";

describe("Moiré", () => {
  const moire = findShader("moire");

  it("is in the gallery", () => {
    expect(gallery.map((entry) => entry.meta.name)).toContain("moire");
    expect(moire?.meta.title).toBe("Moiré");
  });

  it("interferes up to four ring sources", () => {
    const centers = moire?.meta.params.find((p) => p.name === "centers");
    expect(centers).toMatchObject({ type: "int", min: 0, max: 4 });
  });

  it("ships its presets", () => {
    expect(Object.keys(moire?.meta.presets ?? {})).toEqual(["Rings", "Grid", "Drift"]);
  });
});
