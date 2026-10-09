import { describe, expect, it } from "vitest";
import { createFrameStats } from "../../src/engine/frameStats";

describe("createFrameStats", () => {
  it("reports the 95th percentile frame time by nearest rank", () => {
    const stats = createFrameStats(100);
    for (let ms = 100; ms >= 1; ms--) stats.push(ms);
    expect(stats.p95()).toBe(95);
  });

  it("keeps only the most recent frames", () => {
    const stats = createFrameStats(3);
    for (const ms of [50, 50, 50, 10, 10, 10]) stats.push(ms);
    expect(stats.p95()).toBe(10);
  });

  it("has no percentile before the first frame", () => {
    expect(createFrameStats().p95()).toBeNaN();
  });
});
