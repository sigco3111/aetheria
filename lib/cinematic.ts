// Shared cinematic timeline for the island reveal + scroll-driven journey.
// 0-2s   dense fog | 2-5s fog drifts | 5-8s golden light breaks through
// 8-12s  island silhouette appears | 12-16s full reveal
// 16-20s camera orbits | 20-24s descend toward village | 24s+ nav fades in
// After the intro, SCROLL drives one continuous shot:
//   0.00-0.30  descend from the panoramic frame over forest toward the gate
//   0.30-0.58  fly low through the main street, beneath the gate and banners
//   0.58-0.70  slow near the elder's house, the door creaks open
//   0.70-0.74  cross the threshold (screen dips to darkness for a beat)
//   0.74-1.00  drift through the ancient study and zoom into the map

import * as THREE from 'three'

export const INTRO_END = 24
export const NAV_FADE = 24

/** Where the scroll journey hands off from exterior to the study interior. */
export const DOOR_CROSS = 0.72
/** Study room center, hidden far beneath the island. */
export const STUDY_CENTER: [number, number, number] = [0, -60, 0]
/** The elder's house world placement. */
export const ELDER_HOUSE_POS: [number, number, number] = [-3, 4.0, 2.6]

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

/* ------------------------------------------------------------------ */
/*  Scroll-driven journey: one continuous drone shot                    */
/* ------------------------------------------------------------------ */

function curve(points: [number, number, number][]) {
  return new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
    false,
    'centripetal',
    0.5
  )
}

// Exterior: panoramic frame -> over the forest -> under the gate ->
// down the main street -> pause at the elder's door -> through the doorway.
const EXT_POS = curve([
  [4, 9.5, 52],
  [7.5, 8.4, 40],
  [3, 6.4, 29.5],
  [1, 5.0, 21.6],
  [0.8, 4.9, 15.5],
  [-0.4, 5.0, 9.6],
  [-2.2, 4.9, 6.6],
  [-3, 4.88, 5.2],
  [-3, 4.88, 4.6],
  [-3, 4.86, 3.95],
])
const EXT_TGT = curve([
  [0, 6, 14],
  [0.6, 5.2, 15],
  [0.9, 4.7, 12],
  [0.6, 4.6, 8.5],
  [-0.2, 4.7, 5.8],
  [-1.8, 4.8, 4.4],
  [-3, 4.86, 3.4],
  [-3, 4.86, 3.0],
  [-3, 4.86, 2.7],
  [-3, 4.86, 2.4],
])

// Interior: through the door of the ancient study -> drift across the room ->
// zoom down onto the map until it fills the frame.
const INT_POS = curve([
  [0, -56.4, 10.4],
  [0, -56.7, 7.4],
  [1, -56.95, 4.8],
  [0.45, -56.95, 2.7],
  [0, -56.68, 1.25],
  [0, -56.52, 0.45],
])
const INT_TGT = curve([
  [0, -57.3, 3.2],
  [0, -57.45, 2.2],
  [0, -57.65, 1.0],
  [0, -57.8, 0.4],
  [0, -57.86, 0.08],
  [0, -57.88, 0],
])

const _p = new THREE.Vector3()
const _t = new THREE.Vector3()

/** Camera pose along the scroll journey, p in [0, 1]. */
export function journeyPoseAt(p: number): CameraPose {
  const k = clamp01(p)
  if (k < DOOR_CROSS) {
    // Ease so the flight glides fast over the sea and slows near the door.
    const u = easeInOut(k / DOOR_CROSS) * 0.35 + (k / DOOR_CROSS) * 0.65
    EXT_POS.getPoint(u, _p)
    EXT_TGT.getPoint(u, _t)
  } else {
    const u = (k - DOOR_CROSS) / (1 - DOOR_CROSS)
    // Ease-out so the final map zoom settles gently.
    const e = 1 - Math.pow(1 - u, 2.1)
    INT_POS.getPoint(e, _p)
    INT_TGT.getPoint(e, _t)
  }
  return { px: _p.x, py: _p.y, pz: _p.z, tx: _t.x, ty: _t.y, tz: _t.z }
}

/** Darkness overlay while crossing the door threshold (0..1). */
export function doorFadeAt(p: number) {
  const d = (p - DOOR_CROSS) / 0.045
  return Math.exp(-d * d)
}

/** Door open amount 0..1 — begins as the camera slows before the house. */
export function doorOpenAt(p: number) {
  return seg(p, 0.6, 0.7)
}

/** Lantern awakening on the elder's house. */
export function lanternGlowAt(p: number) {
  return seg(p, 0.44, 0.56)
}

/** Raven flight: 0 = absent, ramps in, 1 = perched on the roof. */
export function ravenAt(p: number) {
  return seg(p, 0.38, 0.52)
}

/** Fog density/color along the journey (blends over the intro values). */
export function journeyFog(p: number): { density: number; color: string } {
  if (p < 0.55) return { density: lerp(0.0032, 0.006, seg(p, 0.1, 0.55)), color: '#f2e8d5' }
  if (p < DOOR_CROSS) return { density: lerp(0.006, 0.02, seg(p, 0.55, DOOR_CROSS)), color: '#e8d9bd' }
  return { density: lerp(0.03, 0.045, seg(p, DOOR_CROSS, 1)), color: '#170f08' }
}

/** Rune glow on the ancient map — awakens during the final zoom. */
export function runeGlowAt(p: number) {
  return seg(p, 0.82, 0.97)
}

/* ------------------------------------------------------------------ */
/*  Explorer's table: camera pulls back to an interactive overview     */
/* ------------------------------------------------------------------ */

/** Progress where the map pause ends and the pullback begins. */
export const TABLE_PAUSE_END = 1.06
/** Progress where the pullback finishes and the table is interactive. */
export const TABLE_REVEAL_END = 1.4
/** Maximum allowed progress value (beyond this, scroll stops). */
export const TABLE_MAX_PROGRESS = 1.5

/**
 * Camera pose during the table reveal phase (rawP > 1.0).
 * Smoothly pulls back from the map closeup to a ~37° overhead view.
 */
export function tablePoseAt(rawP: number): CameraPose {
  const start = journeyPoseAt(1.0)
  if (rawP <= TABLE_PAUSE_END) return start

  const t = easeInOut(clamp01((rawP - TABLE_PAUSE_END) / (TABLE_REVEAL_END - TABLE_PAUSE_END)))

  // Overview: camera above and behind the table, angled down ~37°.
  // Table surface in world space: y ≈ -57.91 (STUDY_CENTER[1] + 2.09)
  return {
    px: lerp(start.px, 0, t),
    py: lerp(start.py, -53, t),
    pz: lerp(start.pz, 6.5, t),
    tx: lerp(start.tx, 0, t),
    ty: lerp(start.ty, -57.91, t),
    tz: lerp(start.tz, 0, t),
  }
}

/** 0..1 opacity for artifacts fading in during the table reveal. */
export function tableArtifactFade(rawP: number) {
  return seg(rawP, 1.1, TABLE_REVEAL_END)
}
