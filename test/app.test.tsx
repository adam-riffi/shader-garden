import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
  it("renders the Shader Garden title", () => {
    expect(renderToString(<App />)).toContain("Shader Garden");
  });
});
