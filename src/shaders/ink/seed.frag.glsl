// Ink seed: marbled bands of the two dyes with dark gaps, placed by the seed.
precision highp float;

#include "../common/noise.glsl";

uniform float uSeed;
uniform float uReseed;
uniform vec3 uDyeA;
uniform vec3 uDyeB;
in vec2 vUv;
out vec4 fragColor;

void main() {
  float n = simplex(4.0 * vUv + 100.0 * uSeed + 13.0 * uReseed);
  vec3 dye = n > 0.0 ? uDyeA : uDyeB;
  fragColor = vec4(dye * smoothstep(0.05, 0.35, abs(n)), 1.0);
}
