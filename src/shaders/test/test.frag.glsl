// Engine test pattern: proves that time, resolution and every param type reach the GPU.
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uRings;
uniform float uSpeed;
uniform vec3 uTint;
uniform bool uInvert;
in vec2 vUv;
out vec4 fragColor;

const vec3 NIGHT = vec3(0.043, 0.071, 0.063); // #0b1210

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float rings = 0.5 + 0.5 * sin(uRings * length(p) - uSpeed * uTime);
  if (uInvert) rings = 1.0 - rings;
  fragColor = vec4(mix(NIGHT, uTint, rings * (1.0 - 0.6 * vUv.y)), 1.0);
}
