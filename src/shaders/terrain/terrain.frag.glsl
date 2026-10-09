// Terrain: a domain-warped fBm height field, lit by finite-difference hillshade.
// Warping feeds noise into its own coordinates twice, which folds ridges into valleys.
precision highp float;

#include "../common/noise.glsl";

uniform float uTime;
uniform vec2 uResolution;
uniform float uSeed;
uniform float uWarp;
uniform float uScale;
uniform int uOctaves;
uniform bool uContours;
uniform vec3 uLowland;
uniform vec3 uPeaks;
out vec4 fragColor;

const vec3 SUN = vec3(-0.55, 0.45, 0.70);
const float RELIEF = 0.2;

float height(vec2 p) {
  p += vec2(173.0, 91.0) * uSeed * 10.0;
  // The warp fields are smooth (3 octaves at half frequency); the detail comes from the last fbm.
  vec2 w = 0.5 * p;
  vec2 q = vec2(fbm(w, 3), fbm(w + vec2(5.2, 1.3), 3));
  vec2 drift = vec2(0.02, 0.015) * uTime;
  vec2 r = vec2(
    fbm(w + 1.5 * uWarp * q + vec2(1.7, 9.2) + drift, 3),
    fbm(w + 1.5 * uWarp * q + vec2(8.3, 2.8) - drift, 3)
  );
  return 0.5 + 0.5 * fbm(p + 1.5 * uWarp * r, uOctaves);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y * uScale;
  float h = height(p);

  // Surface normal from the slope over one pixel in each direction.
  float e = uScale / uResolution.y;
  float dx = height(p + vec2(e, 0.0)) - h;
  float dy = height(p + vec2(0.0, e)) - h;
  // Heights are unitless; RELIEF sets how steep they look under the sun.
  vec3 normal = normalize(vec3(-dx * RELIEF, -dy * RELIEF, e));
  float light = clamp(dot(normal, normalize(SUN)), 0.0, 1.0);

  vec3 color = mix(uLowland, uPeaks, smoothstep(0.3, 0.75, h));
  color *= 0.45 + 0.55 * light;

  if (uContours) {
    // Anti-aliased iso-height lines, one pixel wide at any zoom.
    float k = h * 14.0;
    float line = 1.0 - min(abs(fract(k - 0.5) - 0.5) / fwidth(k), 1.0);
    color = mix(color, color * 0.45, 0.8 * line);
  }
  fragColor = vec4(color, 1.0);
}
