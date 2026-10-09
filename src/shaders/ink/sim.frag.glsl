// Ink step: semi-Lagrangian advection of dye by a curl-noise velocity field (no pressure solve).
// The velocity is the curl of a scalar noise potential, so it is divergence-free by construction.
precision highp float;

#include "../common/noise.glsl";

uniform sampler2D uState; // rgb = dye
uniform float uSimTime;   // Seconds of simulation, advanced per step (deterministic).
uniform float uStepDt;    // Seconds per step.
uniform float uSeed;
uniform float uCurl;
uniform float uFlow;
uniform float uFade;
uniform vec3 uDyeA;
uniform vec3 uDyeB;
in vec2 vUv;
out vec4 fragColor;

float potential(vec2 p) {
  return simplex(p * uCurl + vec2(0.0, 0.07 * uSimTime) + 100.0 * uSeed);
}

vec2 velocity(vec2 p) {
  const float e = 0.002;
  float here = potential(p);
  float dx = potential(p + vec2(e, 0.0)) - here;
  float dy = potential(p + vec2(0.0, e)) - here;
  return vec2(dy, -dx) / e; // (d/dy, -d/dx) of the potential.
}

void main() {
  // Follow the flow backwards one step and take the dye found there.
  vec2 from = vUv - uStepDt * uFlow * velocity(vUv);
  vec3 dye = texture(uState, from).rgb * (1.0 - uFade * uStepDt);

  // Two emitters circle the canvas, adding fresh dye.
  for (int i = 0; i < 2; i++) {
    float k = float(i);
    vec2 center = 0.5 + 0.3 * vec2(cos(0.4 * uSimTime + 3.1 * k), sin(0.53 * uSimTime + 3.1 * k));
    vec2 d = vUv - center;
    float source = exp(-dot(d, d) / 0.0008);
    dye = mix(dye, i == 0 ? uDyeA : uDyeB, 0.3 * source);
  }
  fragColor = vec4(dye, 1.0);
}
