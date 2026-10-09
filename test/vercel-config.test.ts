import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const config = JSON.parse(readFileSync("vercel.json", "utf8"));

describe("vercel.json", () => {
  it("rewrites every path to the single-page app", () => {
    expect(config.rewrites).toEqual([{ source: "/(.*)", destination: "/index.html" }]);
  });

  it("sends the DESIGN.md section 13 security headers on every path, and nothing else per rule", () => {
    expect(config.headers).toHaveLength(1);
    const [rule] = config.headers;
    expect(Object.keys(rule).sort()).toEqual(["headers", "source"]);
    expect(rule.source).toBe("/(.*)");
    expect(
      Object.fromEntries(rule.headers.map((h: { key: string; value: string }) => [h.key, h.value])),
    ).toEqual({
      "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
    });
  });
});
