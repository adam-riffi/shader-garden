import { defineMeta } from "../../params/schema";

export const meta = defineMeta({
  name: "aurora",
  title: "Aurora",
  params: [
    { name: "layers", label: "Layers", type: "int", min: 1, max: 6, step: 1, default: 3 },
    {
      name: "intensity",
      label: "Intensity",
      type: "float",
      min: 0,
      max: 3,
      step: 0.05,
      default: 1.2,
    },
    { name: "speed", label: "Speed", type: "float", min: 0, max: 3, step: 0.05, default: 1 },
    { name: "drift", label: "Drift", type: "float", min: -2, max: 2, step: 0.05, default: 0.5 },
    { name: "lower", label: "Lower glow", type: "color", default: "#2cf59a" },
    { name: "upper", label: "Upper glow", type: "color", default: "#7a5cff" },
  ],
  presets: {
    Polar: { layers: 3, intensity: 1.2, speed: 1, drift: 0.5, lower: "#2cf59a", upper: "#7a5cff" },
    "Solar storm": {
      layers: 6,
      intensity: 2.2,
      speed: 2,
      drift: 1.2,
      lower: "#ff3d7f",
      upper: "#ffd36b",
    },
  },
});
