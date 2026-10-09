// Compiles, links and draws every shader program in headless Chromium (WebGL2 on SwiftShader).
// Fails on any compile or link error, any warning in an info log, or a GL error while drawing.
// Usage: pnpm shaders:check
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import type { ShaderProgram } from "../src/shaders/programs";

interface Result {
  name: string;
  problems: string[];
}

// Runs in the browser. Sources get the same `#version 300 es` prefix three adds to a GLSL3
// RawShaderMaterial, so this compiles exactly what the app runs.
function checkPrograms(programs: ShaderProgram[]): Result[] {
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return [{ name: "(context)", problems: ["WebGL2 is unavailable"] }];
  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.width = 64;
  canvas.height = 64;

  return programs.map(({ name, vertex, fragment }) => {
    const problems: string[] = [];
    const compile = (type: number, label: string, source: string) => {
      const shader = gl.createShader(type) as WebGLShader;
      gl.shaderSource(shader, `#version 300 es\n${source}`);
      gl.compileShader(shader);
      const log = gl.getShaderInfoLog(shader)?.trim();
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) problems.push(`${label}: ${log}`);
      else if (log) problems.push(`${label} warning: ${log}`);
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, "vertex", vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, "fragment", fragment));
    if (problems.length > 0) return { name, problems };

    gl.linkProgram(program);
    const log = gl.getProgramInfoLog(program)?.trim();
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      return { name, problems: [`link: ${log}`] };
    if (log) problems.push(`link warning: ${log}`);

    // Draw one full-screen quad, the way ShaderView does, at a fixed time.
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook.
    gl.useProgram(program);
    const quad: Record<string, [number, number[]]> = {
      position: [3, [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]],
      uv: [2, [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]],
    };
    for (const [attribute, [size, data]] of Object.entries(quad)) {
      const location = gl.getAttribLocation(program, attribute);
      if (location < 0) continue;
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
    gl.uniform1f(gl.getUniformLocation(program, "uTime"), 2);
    gl.uniform2f(gl.getUniformLocation(program, "uResolution"), canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    const error = gl.getError();
    if (error !== gl.NO_ERROR) problems.push(`draw: GL error 0x${error.toString(16)}`);
    return { name, problems };
  });
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: "custom",
  logLevel: "error",
});
let programs: ShaderProgram[];
try {
  const module = await vite.ssrLoadModule("/src/shaders/programs.ts");
  programs = (module as typeof import("../src/shaders/programs")).loadPrograms();
} finally {
  await vite.close();
}

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage();
  const results = await page.evaluate(checkPrograms, programs);
  for (const { name, problems } of results) {
    console.log(`${problems.length === 0 ? "ok  " : "FAIL"} ${name}`);
    for (const problem of problems) console.log(`     ${problem}`);
  }
  const failed = results.filter((result) => result.problems.length > 0).length;
  console.log(`${results.length - failed} of ${results.length} shader programs passed`);
  if (failed > 0 || results.length === 0) process.exitCode = 1;
} finally {
  await browser.close();
}
