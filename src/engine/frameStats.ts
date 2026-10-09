/** Rolling frame-time statistics over the most recent `capacity` frames. */
export interface FrameStats {
  push(frameMs: number): void;
  /** 95th percentile frame time in milliseconds (nearest rank); NaN before the first frame. */
  p95(): number;
}

export function createFrameStats(capacity = 120): FrameStats {
  const frames: number[] = [];
  let next = 0;
  return {
    push(frameMs) {
      frames[next] = frameMs;
      next = (next + 1) % capacity;
    },
    p95() {
      if (frames.length === 0) return Number.NaN;
      const sorted = frames.toSorted((a, b) => a - b);
      return sorted[Math.ceil(0.95 * sorted.length) - 1] ?? Number.NaN;
    },
  };
}
