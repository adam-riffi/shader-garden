import { defineMeta } from "../../params/schema";

/** The engine test pattern; exercises every param type until the M3 shaders arrive. */
export const meta = defineMeta({
  name: "test",
  title: "Test pattern",
  params: [
    { name: "rings", label: "Rings", type: "float", min: 4, max: 40, step: 0.5, default: 18 },
    { name: "speed", label: "Speed", type: "float", min: 0, max: 5, step: 0.1, default: 2 },
    { name: "tint", label: "Tint", type: "color", default: "#7cf2a4" },
    { name: "invert", label: "Invert", type: "bool", default: false },
  ],
  presets: { Calm: { rings: 8, speed: 0.5 } },
});
