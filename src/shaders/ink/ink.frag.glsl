// Ink display: the dye texture, cropped to cover the canvas, over the night background.
precision highp float;

uniform sampler2D uState;
uniform vec2 uResolution;
out vec4 fragColor;

const vec3 NIGHT = vec3(0.043, 0.071, 0.063);

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / max(uResolution.x, uResolution.y) + 0.5;
  vec3 dye = texture(uState, uv).rgb;
  fragColor = vec4(NIGHT + dye * (1.0 - NIGHT), 1.0);
}
