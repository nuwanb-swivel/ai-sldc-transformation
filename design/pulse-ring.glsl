/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Ring Color
 * @color
 * @default #5B5CF6
 */
uniform vec3 u_color;

/**
 * @label Speed
 * @default 0.5
 * @range 0.1, 2.0
 */
uniform float u_speed;

float ringMask(float dist, float radius, float thickness) {
  return smoothstep(radius - thickness, radius, dist) * (1.0 - smoothstep(radius, radius + thickness, dist));
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) - 0.5;
  float dist = length(uv) * 2.0;

  float alpha = 0.0;
  for (int i = 0; i < 3; i++) {
    float phase = fract(u_time * u_speed + float(i) / 3.0);
    float radius = 0.18 + phase * 0.8;
    float fade = 1.0 - phase;
    alpha += ringMask(dist, radius, 0.03 + phase * 0.02) * fade * 0.7;
  }

  gl_FragColor = vec4(u_color, clamp(alpha, 0.0, 1.0));
}
