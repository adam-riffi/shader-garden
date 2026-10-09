import { defineMeta } from "../../params/schema";

export const meta = defineMeta({
  name: "moire",
  title: "Moiré",
  params: [
    {
      name: "frequency",
      label: "Density",
      type: "float",
      min: 20,
      max: 120,
      step: 1,
      default: 60,
    },
    { name: "centers", label: "Ring sources", type: "int", min: 0, max: 4, step: 1, default: 2 },
    { name: "lines", label: "Line gratings", type: "bool", default: false },
    {
      name: "rotation",
      label: "Rotation",
      type: "float",
      min: -1,
      max: 1,
      step: 0.01,
      default: 0.15,
    },
    {
      name: "width",
      label: "Line width",
      type: "float",
      min: 0.1,
      max: 0.9,
      step: 0.01,
      default: 0.3,
    },
    { name: "color", label: "Colour", type: "color", default: "#7cf2a4" },
  ],
  presets: {
    Rings: { frequency: 60, centers: 2, lines: false, width: 0.3 },
    Grid: { frequency: 80, centers: 0, lines: true, rotation: 0.05, width: 0.35 },
    Drift: { frequency: 45, centers: 3, lines: true, rotation: 0.4, width: 0.2 },
  },
});
