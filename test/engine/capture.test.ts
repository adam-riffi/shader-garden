import { describe, expect, it } from "vitest";
import { captureTime } from "../../src/engine/capture";

describe("captureTime", () => {
  it("reads a frozen time in seconds from ?t=", () => {
    expect(captureTime("?t=2")).toBe(2);
    expect(captureTime("?v=1&s=1&t=0.5")).toBe(0.5);
    expect(captureTime("?t=0")).toBe(0);
  });

  it.each(["", "?v=1", "?t=", "?t=abc", "?t=-1", "?t=Infinity"])(
    "is undefined for %s (normal, live view)",
    (search) => {
      expect(captureTime(search)).toBeUndefined();
    },
  );
});
