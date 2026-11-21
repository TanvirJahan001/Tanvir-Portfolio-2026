// A warped torus sampled along interlacing filaments. All artwork is procedural.
export function orbitalField(strands = 115, samples = 380) {
  const points = new Float32Array(strands * samples * 4);
  let index = 0;
  for (let s = 0; s < strands; s++) {
    const v = (s / strands) * Math.PI * 2;
    for (let i = 0; i < samples; i++) {
      const u = ((i + (s % 3) / 3) / samples) * Math.PI * 2;
      const twist = v + u * 2 + 0.34 * Math.sin(3 * u);
      const radius =
        0.66 +
        0.07 * Math.sin(3 * u + 0.2) +
        (0.17 + 0.035 * Math.sin(u * 2)) * Math.cos(twist);
      const x = radius * Math.cos(u);
      const y = radius * Math.sin(u);
      const z = 0.27 * Math.sin(2 * u + 0.6) + 0.22 * Math.sin(twist);
      const height = y * 0.76 - z * 0.65;
      points[index++] = 1.1 * (x * 0.88 - height * 0.47);
      points[index++] = 1.1 * (x * 0.47 + height * 0.88);
      points[index++] = y * 0.65 + z * 0.76;
      const sheen = (0.5 + 0.5 * Math.cos(twist - u - 0.7)) ** 2;
      const rib = (0.5 + 0.5 * Math.cos(9 * v + 2 * u)) ** 1.6;
      points[index++] = 0.11 + 0.58 * sheen + 0.29 * rib;
    }
  }
  return points;
}
