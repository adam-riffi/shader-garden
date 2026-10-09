import { describe, expect, it } from "vitest";
import { findShader, gallery, registry } from "../../src/shaders/registry";

const metaFolders = Object.keys(import.meta.glob("/src/shaders/*/meta.ts"))
  .map((path) => path.split("/")[3])
  .sort();

describe("registry", () => {
  it("lists every shader folder that has metadata, once", () => {
    expect(registry.map((entry) => entry.meta.name).sort()).toEqual(metaFolders);
  });

  it("finds a shader by name, including hidden ones", () => {
    expect(findShader("test")?.meta.title).toBe("Test pattern");
    expect(findShader("nope")).toBeUndefined();
  });

  it("keeps hidden shaders out of the gallery", () => {
    expect(gallery.some((entry) => entry.meta.name === "test")).toBe(false);
  });
});
