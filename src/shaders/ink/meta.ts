import { defineMeta } from "../../params/schema";

export const meta = defineMeta({
  name: "ink",
  title: "Ink",
  params: [
    { name: "curl", label: "Curl scale", type: "float", min: 1, max: 8, step: 0.1, default: 3 },
    { name: "flow", label: "Flow", type: "float", min: 0, max: 0.3, step: 0.005, default: 0.06 },
    { name: "fade", label: "Fade", type: "float", min: 0, max: 1, step: 0.01, default: 0.1 },
    { name: "dyeA", label: "Dye A", type: "color", default: "#7cf2a4" },
    { name: "dyeB", label: "Dye B", type: "color", default: "#ff6ad5" },
  ],
  presets: {
    Marble: { curl: 2.5, flow: 0.04, fade: 0.03, dyeA: "#7cf2a4", dyeB: "#ff6ad5" },
    Smoke: { curl: 5, flow: 0.12, fade: 0.4, dyeA: "#d9e4dd", dyeB: "#6b7d8f" },
  },
});
