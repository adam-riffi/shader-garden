import { defineMeta } from "../../params/schema";

export const meta = defineMeta({
  name: "terrain",
  title: "Terrain",
  params: [
    { name: "warp", label: "Warp", type: "float", min: 0, max: 2, step: 0.01, default: 0.6 },
    { name: "scale", label: "Scale", type: "float", min: 0.5, max: 6, step: 0.1, default: 2.5 },
    { name: "octaves", label: "Octaves", type: "int", min: 1, max: 8, step: 1, default: 5 },
    { name: "contours", label: "Contours", type: "bool", default: false },
    { name: "lowland", label: "Lowland", type: "color", default: "#1d3b2a" },
    { name: "peaks", label: "Peaks", type: "color", default: "#e6efe0" },
  ],
  presets: {
    Highlands: {
      warp: 0.8,
      scale: 2.5,
      octaves: 6,
      contours: true,
      lowland: "#1d3b2a",
      peaks: "#e6efe0",
    },
    Dunes: {
      warp: 0.4,
      scale: 1.5,
      octaves: 3,
      contours: false,
      lowland: "#5a3b1e",
      peaks: "#f2d39b",
    },
    Archipelago: {
      warp: 1.4,
      scale: 3.5,
      octaves: 6,
      contours: false,
      lowland: "#0b2a3a",
      peaks: "#7cf2a4",
    },
  },
});
