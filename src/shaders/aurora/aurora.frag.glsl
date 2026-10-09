// Aurora: layered noise ribbons over a star field. Each curtain has a sharp lower edge that
// wanders with fBm and a long glow fading upward, streaked by vertical rays, added together.
precision highp float;

#include "../common/noise.glsl";

uniform float uTime;
uniform vec2 uResolution;
uniform float uSeed;
uniform int uLayers;
uniform float uIntensity;
uniform float uSpeed;
uniform float uDrift;
uniform vec3 uLower;
uniform vec3 uUpper;
out vec4 fragColor;

const int MAX_LAYERS = 6;

float stars(vec2 p) {
  vec2 cell = floor(p);
  float h = hash12(cell + 31.0);
  if (h < 0.97) return 0.0; // About 3% of cells hold a star.
  vec2 offset = vec2(hash12(cell + 1.0), hash12(cell + 2.0)) - 0.5;
  float d = length(fract(p) - 0.5 - 0.35 * offset);
  float twinkle = 0.6 + 0.4 * sin(uTime * (1.0 + 3.0 * h) + 40.0 * h);
  return smoothstep(0.08, 0.0, d) * twinkle;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float t = uTime * uSpeed;
  float seed = uSeed * 1000.0;

  vec3 color = mix(vec3(0.043, 0.071, 0.063), vec3(0.004, 0.008, 0.016), uv.y); // Night garden sky.
  color += 0.7 * stars(p * 90.0);

  for (int i = 0; i < MAX_LAYERS; i++) {
    if (i >= uLayers) break;
    float layer = float(i);
    float x = p.x * (0.9 + 0.25 * layer) + seed + 3.7 * layer;
    float edge = 0.02 + 0.08 * layer + 0.2 * fbm(vec2(1.2 * x + 0.3 * uDrift * t, 1.7 * layer + 0.05 * t), 4);
    float above = p.y - edge;
    // Long glow above the edge, a soft fade below it, and a bright fringe right at it.
    float curtain = above > 0.0 ? exp(-above * (5.0 + 2.0 * layer)) : exp(above * 22.0);
    curtain += 0.6 * exp(-abs(above) * 45.0);
    float rays = 0.55 + 0.45 * valueNoise(vec2(30.0 * x, 0.7 * t + layer));
    float shimmer = 0.6 + 0.4 * simplex(vec2(3.0 * x - 0.8 * t, layer));
    vec3 hue = mix(uLower, uUpper, clamp(2.5 * above, 0.0, 1.0));
    color += hue * curtain * rays * shimmer * uIntensity / (1.0 + 0.5 * layer);
  }
  fragColor = vec4(1.0 - exp(-1.3 * color), 1.0); // Soft tone map: overlapping glow never clips.
}
