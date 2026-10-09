// Engine test pattern: proves that the time and resolution uniforms reach the GPU.
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 fragColor;

const vec3 NIGHT = vec3(0.043, 0.071, 0.063);    // #0b1210
const vec3 PHOSPHOR = vec3(0.486, 0.949, 0.643); // #7cf2a4

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float rings = 0.5 + 0.5 * sin(18.0 * length(p) - 2.0 * uTime);
  fragColor = vec4(mix(NIGHT, PHOSPHOR, rings * (1.0 - 0.6 * vUv.y)), 1.0);
}
