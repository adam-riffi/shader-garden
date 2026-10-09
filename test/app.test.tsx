import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
  it("renders the Shader Garden title", () => {
    const html = renderToString(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(html).toContain("Shader Garden");
  });
});
