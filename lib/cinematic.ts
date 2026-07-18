// Shared cinematic timeline for the island reveal.
// 0-2s   dense fog | 2-5s fog drifts | 5-8s golden light breaks through
// 8-12s  island silhouette appears | 12-16s full reveal
// 16-20s camera orbits | 20-24s descend toward village | 24s+ nav fades in

export const INTRO_END = 24
export const NAV_FADE = 24

export function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function clamp01(x: number) {
  return Math.min(1, Math.max(0, x))
}

/** Normalized progress of t between a and b, eased. */
export function seg(t: number, a: number, b: number) {
  return easeInOut(clamp01((t - a) / (b - a)))
}

export function lerp(a: number, b: number, x: number) {
  return a + (b - a) * x
}

/** Fog density over the timeline (FogExp2). */
export function fogDensityAt(t: number) {
  if (t < 2) return 0.058
  if (t < 5) return lerp(0.058, 0.04, seg(t, 2, 5))
  if (t < 8) return lerp(0.04, 0.02, seg(t, 5, 8))
  if (t < 12) return lerp(0.02, 0.0085, seg(t, 8, 12))
  if (t < 16) return lerp(0.0085, 0.005, seg(t, 12, 16))
  if (t < 24) return lerp(0.005, 0.0032, seg(t, 16, 24))
  return 0.0032
}

/** Sun/ambient intensity ramp as golden light pierces the fog. */
export function lightRampAt(t: number) {
  return lerp(0.25, 1, seg(t, 4, 11))
}

export interface CameraPose {
  px: number
  py: number
  pz: number
  tx: number
  ty: number
  tz: number
}

/** Cinematic camera path. Distances in world units; island radius ~30. */
export function cameraPoseAt(t: number): CameraPose {
  // Phase A: 0-12s slow push forward through the fog
  if (t < 12) {
    const k = seg(t, 0, 12)
    return {
      px: 0,
      py: lerp(34, 24, k),
      pz: lerp(195, 96, k),
      tx: 0,
      ty: lerp(16, 11, k),
      tz: 0,
    }
  }
  // Phase B: 12-20s one full smooth orbit around the island
  if (t < 20) {
    const k = seg(t, 12, 20)
    const theta = k * Math.PI * 2
    const r = lerp(96, 74, k)
    const h = 24 - Math.sin(k * Math.PI) * 4
    return {
      px: Math.sin(theta) * r,
      py: h,
      pz: Math.cos(theta) * r,
      tx: 0,
      ty: 11,
      tz: 0,
    }
  }
  // Phase C: 20-24s descend toward the village entrance
  if (t < 24) {
    const k = seg(t, 20, 24)
    return {
      px: lerp(0, 4, k),
      py: lerp(24, 9.5, k),
      pz: lerp(74, 52, k),
      tx: lerp(0, 0, k),
      ty: lerp(11, 6, k),
      tz: lerp(0, 14, k),
    }
  }
  // Phase D: settled panoramic frame with a gentle living drift
  const i = t - 24
  return {
    px: 4 + Math.sin(i * 0.22) * 1.6,
    py: 9.5 + Math.sin(i * 0.31) * 0.7,
    pz: 52 + Math.cos(i * 0.17) * 1.4,
    tx: 0,
    ty: 6 + Math.sin(i * 0.2) * 0.25,
    tz: 14,
  }
}
