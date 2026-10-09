import { defineMeta } from "../../params/schema";

export const meta = defineMeta({
  name: "mandelbulb",
  title: "Mandelbulb",
  params: [
    { name: "power", label: "Power", type: "float", min: 2, max: 12, step: 0.1, default: 8 },
    { name: "spin", label: "Spin", type: "float", min: 0, max: 2, step: 0.05, default: 1 },
    { name: "glow", label: "Glow", type: "float", min: 0, max: 2, step: 0.05, default: 0.6 },
    { name: "core", label: "Core", type: "color", default: "#2b6b4f" },
    { name: "rim", label: "Rim", type: "color", default: "#7cf2a4" },
  ],
  presets: {
    Classic: { power: 8, spin: 1, glow: 0.6, core: "#2b6b4f", rim: "#7cf2a4" },
    Bloom: { power: 4.5, spin: 0.6, glow: 1, core: "#5b2a6e", rim: "#ffb3d9" },
    Spiky: { power: 11.5, spin: 1.4, glow: 0.4, core: "#1e3a5f", rim: "#ffd36b" },
  },
});
