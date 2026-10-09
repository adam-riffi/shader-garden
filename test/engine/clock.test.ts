import { describe, expect, it } from "vitest";
import { createClock } from "../../src/engine/clock";

describe("createClock", () => {
  it("starts at the given time, running by default", () => {
    const clock = createClock({ time: 1.5 });
    expect(clock.time).toBe(1.5);
    expect(clock.paused).toBe(false);
  });

  it("advances by the frame delta on tick", () => {
    const clock = createClock();
    clock.tick(0.016);
    clock.tick(0.017);
    expect(clock.time).toBeCloseTo(0.033, 10);
  });

  it("ignores ticks while paused but still steps exactly", () => {
    const clock = createClock({ time: 2, paused: true });
    clock.tick(0.5);
    expect(clock.time).toBe(2);
    clock.step(0.25);
    expect(clock.time).toBe(2.25);
  });

  it("resumes after play and stops after pause", () => {
    const clock = createClock();
    clock.pause();
    clock.tick(1 / 60);
    expect(clock.time).toBe(0);
    clock.play();
    clock.tick(0.05);
    expect(clock.time).toBe(0.05);
  });

  it("clamps a long frame so a backgrounded tab does not jump the animation", () => {
    const clock = createClock({ maxDelta: 0.1 });
    clock.tick(5);
    expect(clock.time).toBe(0.1);
  });

  it("ignores negative and non-finite deltas", () => {
    const clock = createClock({ time: 1 });
    clock.tick(-1);
    clock.tick(Number.NaN);
    clock.step(Number.POSITIVE_INFINITY);
    expect(clock.time).toBe(1);
  });

  it("sets the time exactly, for captures and goldens", () => {
    const clock = createClock();
    clock.tick(0.3);
    clock.setTime(2);
    expect(clock.time).toBe(2);
  });
});
