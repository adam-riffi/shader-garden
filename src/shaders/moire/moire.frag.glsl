// Moiré: overlapping gratings. Each sheet lets light through its gaps; multiplying the sheets'
// transmissions makes slow beat patterns appear wherever the fine lines drift in and out of step.
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uSeed;
uniform float uFrequency; // Lines per screen height.
uniform int uCenters;
uniform bool uLines;
uniform float uRotation;
uniform float uWidth;
uniform vec3 uColor;
out vec4 fragColor;

const int MAX_CENTERS = 4;
const vec3 NIGHT = vec3(0.043, 0.071, 0.063); // #0b1210

// Fraction of light a sheet lets through at `distance` across its lines: 0 on a line, 1 in a gap.
float transmission(float distance) {
  float g = cos(6.28318530718 * uFrequency * distance);
  float threshold = 1.0 - 2.0 * uWidth;
  float aa = fwidth(g);
  return 1.0 - smoothstep(threshold - aa, threshold + aa, g);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float seed = uSeed * 6.28318530718;
  float light = 1.0;

  for (int i = 0; i < MAX_CENTERS; i++) {
    if (i >= uCenters) break;
    float k = float(i);
    vec2 center = 0.3 * vec2(
      sin(0.37 * (k + 1.0) * uTime + seed + 2.1 * k),
      cos(0.29 * (k + 1.3) * uTime + 1.7 * seed + k)
    );
    light *= transmission(length(p - center));
  }

  if (uLines) {
    float angle = uRotation * uTime + seed;
    light *= transmission(p.x);
    light *= transmission(dot(p, vec2(cos(angle), sin(angle))));
  }

  fragColor = vec4(mix(NIGHT, uColor, light), 1.0);
}
