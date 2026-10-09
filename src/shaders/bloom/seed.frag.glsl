// Bloom seed: chemical A everywhere, with a dozen random drops of B to start the reaction.
precision highp float;

#include "../common/noise.glsl";

uniform float uSeed;
uniform float uReseed;
in vec2 vUv;
out vec4 fragColor;

void main() {
  float b = 0.0;
  for (int i = 0; i < 12; i++) {
    vec2 cell = vec2(float(i), 1000.0 * uSeed + 17.0 * uReseed);
    vec2 center = 0.15 + 0.7 * vec2(hash12(cell), hash12(cell + vec2(0.0, 101.0)));
    float radius = 0.015 + 0.03 * hash12(cell + vec2(0.0, 211.0));
    b = max(b, step(length(vUv - center), radius));
  }
  fragColor = vec4(1.0, b, 0.0, 1.0);
}
