import { defineMeta } from "../../params/schema";

export const meta = defineMeta({
  name: "bloom",
  title: "Bloom",
  params: [
    {
      name: "feed",
      label: "Feed",
      type: "float",
      min: 0.01,
      max: 0.1,
      step: 0.0001,
      default: 0.0545,
    },
    {
      name: "kill",
      label: "Kill",
      type: "float",
      min: 0.045,
      max: 0.07,
      step: 0.0001,
      default: 0.062,
    },
    { name: "tint", label: "Tint", type: "color", default: "#ff8a65" },
  ],
  presets: {
    Coral: { feed: 0.0545, kill: 0.062, tint: "#ff8a65" },
    Mitosis: { feed: 0.0367, kill: 0.0649, tint: "#7cf2a4" },
    Maze: { feed: 0.029, kill: 0.057, tint: "#9ad1ff" },
    Spots: { feed: 0.03, kill: 0.062, tint: "#ffd36b" },
  },
});
