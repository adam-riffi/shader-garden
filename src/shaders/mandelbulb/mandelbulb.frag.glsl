// Mandelbulb: the 3D power-n analogue of the Mandelbrot set, drawn by sphere tracing its distance
// estimator. Shadows march towards the light; ambient occlusion comes from how many steps a ray took.
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uSeed;
uniform float uPower;
uniform float uSpin;
uniform float uGlow;
uniform vec3 uCore;
uniform vec3 uRim;
out vec4 fragColor;

const int MAX_STEPS = 128;
const int ITERATIONS = 8;
const float BOUND = 1.25; // The bulb fits inside this sphere for every power in 2..12.
const vec3 NIGHT = vec3(0.043, 0.071, 0.063);

// Distance estimate to the set: escape-time iteration in spherical coordinates, with the running
// derivative dr giving 0.5 * log(r) * r / dr. `trap` records how close the orbit came to the origin.
float bulb(vec3 position, out float trap) {
  vec3 z = position;
  float dr = 1.0;
  float r = 0.0;
  trap = 1e9;
  for (int i = 0; i < ITERATIONS; i++) {
    r = length(z);
    if (r > 2.0) break;
    float theta = acos(clamp(z.z / r, -1.0, 1.0)) * uPower;
    float phi = atan(z.y, z.x) * uPower;
    dr = pow(r, uPower - 1.0) * uPower * dr + 1.0;
    z = pow(r, uPower) * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta)) + position;
    trap = min(trap, dot(z, z));
  }
  return 0.5 * log(r) * r / dr;
}

float bulb(vec3 position) {
  float trap;
  return bulb(position, trap);
}

vec3 normalAt(vec3 p) {
  const vec2 k = vec2(1.0, -1.0);
  const float h = 0.0005;
  return normalize(
    k.xyy * bulb(p + k.xyy * h) + k.yyx * bulb(p + k.yyx * h) +
    k.yxy * bulb(p + k.yxy * h) + k.xxx * bulb(p + k.xxx * h)
  );
}

float softShadow(vec3 origin, vec3 direction) {
  float light = 1.0;
  float t = 0.01;
  for (int i = 0; i < 32; i++) {
    float d = bulb(origin + direction * t);
    light = min(light, 8.0 * d / t);
    t += clamp(d, 0.01, 0.2);
    if (light < 0.01 || t > 2.5) break;
  }
  return clamp(light, 0.0, 1.0);
}

// Entry and exit distances of the ray through the bounding sphere, or a negative exit on a miss.
vec2 boundingSphere(vec3 origin, vec3 direction) {
  float b = dot(origin, direction);
  float c = dot(origin, origin) - BOUND * BOUND;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float angle = 0.15 * uSpin * uTime + 6.28318530718 * uSeed;
  vec3 eye = 4.0 * vec3(sin(angle), 0.35, cos(angle));
  vec3 forward = normalize(-eye);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  vec3 ray = normalize(p.x * right + p.y * up + 1.6 * forward);

  vec3 color = NIGHT * (1.2 - 0.6 * length(p));
  vec2 span = boundingSphere(eye, ray);
  if (span.y > 0.0) {
    float t = max(span.x, 0.0);
    float trap = 1.0;
    int steps = 0;
    bool hit = false;
    for (; steps < MAX_STEPS; steps++) {
      float d = bulb(eye + ray * t, trap);
      if (d < 0.0004 * t) {
        hit = true;
        break;
      }
      t += d;
      if (t > span.y) break;
    }
    float occlusion = 1.0 - float(steps) / float(MAX_STEPS);
    if (hit) {
      vec3 position = eye + ray * t;
      vec3 normal = normalAt(position);
      vec3 sun = normalize(vec3(0.6, 0.8, 0.4));
      float diffuse = max(dot(normal, sun), 0.0) * softShadow(position + 0.002 * normal, sun);
      float rim = pow(1.0 - max(dot(normal, -ray), 0.0), 3.0);
      vec3 albedo = mix(uCore, uRim, clamp(sqrt(trap), 0.0, 1.0));
      color = albedo * (0.15 + 0.85 * diffuse) * occlusion + uRim * rim * 0.4 * occlusion;
    } else {
      // Rays that grazed the surface took many steps: a soft halo traces the silhouette.
      color += uRim * uGlow * pow(1.0 - occlusion, 2.0);
    }
  }
  fragColor = vec4(pow(color, vec3(0.9)), 1.0);
}
