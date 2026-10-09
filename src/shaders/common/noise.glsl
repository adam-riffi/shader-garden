// Noise primitives shared by the shaders, written for this project (DESIGN.md section 6).
// Lattice values come from an integer hash, so they match across GPUs and drivers.

uint hashU(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352dU;
  x ^= x >> 15;
  x *= 0x846ca68bU;
  x ^= x >> 16;
  return x;
}

// Pseudo-random value in [0, 1] for an integer lattice cell. The hashes are chained, not XORed
// with a multiple of x: XOR left neighbouring cells' values correlated (points fell on a ring).
float hash12(vec2 cell) {
  uvec2 c = uvec2(ivec2(cell));
  return float(hashU(c.x + hashU(c.y + 0x9e3779b9U))) / 4294967295.0;
}

// Smoothly interpolated lattice values, in [0, 1].
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 gradient(vec2 cell) {
  float angle = 6.28318530718 * hash12(cell);
  return vec2(cos(angle), sin(angle));
}

// 2D simplex noise, in about [-1, 1]. Skewing the plane turns the triangle grid into squares,
// so each point finds its triangle's three corners and sums their radially falling contributions.
float simplex(vec2 p) {
  const float SKEW = 0.36602540378;   // (sqrt(3) - 1) / 2
  const float UNSKEW = 0.21132486540; // (3 - sqrt(3)) / 6
  vec2 cell = floor(p + (p.x + p.y) * SKEW);
  vec2 x0 = p - cell + (cell.x + cell.y) * UNSKEW;
  vec2 step1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 x1 = x0 - step1 + UNSKEW;
  vec2 x2 = x0 - 1.0 + 2.0 * UNSKEW;
  vec3 falloff = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  falloff *= falloff;
  falloff *= falloff;
  vec3 ramps = vec3(
    dot(gradient(cell), x0),
    dot(gradient(cell + step1), x1),
    dot(gradient(cell + 1.0), x2)
  );
  return 70.0 * dot(falloff, ramps);
}

// Fractal Brownian motion: octaves of simplex noise at doubling frequency and halving amplitude,
// rotated between octaves to hide the lattice. Normalized to about [-1, 1].
const int MAX_OCTAVES = 8;

float fbm(vec2 p, int octaves) {
  const mat2 ROTATE = mat2(0.8, -0.6, 0.6, 0.8);
  float sum = 0.0;
  float amplitude = 0.5;
  float norm = 0.0;
  for (int i = 0; i < MAX_OCTAVES; i++) {
    if (i >= octaves) break;
    sum += amplitude * simplex(p);
    norm += amplitude;
    p = ROTATE * p * 2.0 + 17.0;
    amplitude *= 0.5;
  }
  return sum / norm;
}
