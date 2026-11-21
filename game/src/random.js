// Pure seeded PRNG helpers. No DOM access in this module.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function randRange(rng, min, max) {
  return min + rng() * (max - min);
}
export function randInt(rng, min, max) {
  return Math.floor(randRange(rng, min, max + 1));
}
export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
export function chance(rng, p) {
  return rng() < p;
}
