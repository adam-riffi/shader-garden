/**
 * Shader time in seconds, decoupled from wall time so a capture or golden test can freeze or
 * step it and get the same frame every run (DESIGN.md section 6, "Determinism").
 */
export interface Clock {
  readonly time: number;
  readonly paused: boolean;
  /** Advances by a frame delta in seconds. Ignored while paused; clamped to `maxDelta`. */
  tick(delta: number): void;
  /** Advances by exactly `delta` seconds, even while paused. */
  step(delta: number): void;
  setTime(time: number): void;
  pause(): void;
  play(): void;
}

export interface ClockOptions {
  time?: number;
  paused?: boolean;
  /** Longest frame tick() accepts, so a tab coming back from the background does not jump. */
  maxDelta?: number;
}

export function createClock({
  time = 0,
  paused = false,
  maxDelta = 0.1,
}: ClockOptions = {}): Clock {
  const valid = (delta: number) => Number.isFinite(delta) && delta > 0;
  const clock = {
    time,
    paused,
    tick(delta: number) {
      if (!clock.paused && valid(delta)) clock.time += Math.min(delta, maxDelta);
    },
    step(delta: number) {
      if (valid(delta)) clock.time += delta;
    },
    setTime(next: number) {
      clock.time = next;
    },
    pause() {
      clock.paused = true;
    },
    play() {
      clock.paused = false;
    },
  };
  return clock;
}
