// Bloom step: one explicit Euler step of the Gray-Scott reaction-diffusion model.
// A feeds in at rate uFeed, B is removed at uKill + uFeed, and A + 2B turns into 3B.
precision highp float;

uniform sampler2D uState; // r = A, g = B
uniform vec2 uTexel;
uniform float uFeed;
uniform float uKill;
in vec2 vUv;
out vec4 fragColor;

const float DIFFUSE_A = 1.0;
const float DIFFUSE_B = 0.5;

vec2 at(float dx, float dy) {
  return texture(uState, vUv + vec2(dx, dy) * uTexel).rg;
}

void main() {
  vec2 c = at(0.0, 0.0);
  // 3x3 Laplacian: edges weigh 0.2, corners 0.05, the centre -1.
  vec2 laplacian = -c
    + 0.2 * (at(1.0, 0.0) + at(-1.0, 0.0) + at(0.0, 1.0) + at(0.0, -1.0))
    + 0.05 * (at(1.0, 1.0) + at(-1.0, 1.0) + at(1.0, -1.0) + at(-1.0, -1.0));
  float reaction = c.r * c.g * c.g;
  float a = c.r + DIFFUSE_A * laplacian.r - reaction + uFeed * (1.0 - c.r);
  float b = c.g + DIFFUSE_B * laplacian.g + reaction - (uKill + uFeed) * c.g;
  fragColor = vec4(clamp(a, 0.0, 1.0), clamp(b, 0.0, 1.0), 0.0, 1.0);
}
