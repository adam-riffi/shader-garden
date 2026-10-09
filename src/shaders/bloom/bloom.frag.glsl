// Bloom display: the concentration of B, cropped to cover the canvas, with lit edges.
precision highp float;

uniform sampler2D uState;
uniform vec2 uResolution;
uniform vec2 uTexel;
uniform vec3 uTint;
out vec4 fragColor;

const vec3 NIGHT = vec3(0.043, 0.071, 0.063);

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / max(uResolution.x, uResolution.y) + 0.5;
  float b = texture(uState, uv).g;
  vec2 slope = vec2(
    texture(uState, uv + vec2(uTexel.x, 0.0)).g - texture(uState, uv - vec2(uTexel.x, 0.0)).g,
    texture(uState, uv + vec2(0.0, uTexel.y)).g - texture(uState, uv - vec2(0.0, uTexel.y)).g
  );
  float body = smoothstep(0.08, 0.35, b);
  float edge = clamp(6.0 * length(slope), 0.0, 1.0);
  vec3 color = mix(NIGHT, uTint, body) + 0.35 * edge * mix(uTint, vec3(1.0), 0.5);
  fragColor = vec4(color, 1.0);
}
