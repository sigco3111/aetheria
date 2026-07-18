'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Positions where trees are allowed (avoid village, castle, river, ruins) */
function treeSpots(count: number, seed: number) {
  const rnd = mulberry32(seed)
  const spots: { x: number; z: number; s: number }[] = []
  let guard = 0
  while (spots.length < count && guard < count * 30) {
    guard++
    const a = rnd() * Math.PI * 2
    const r = 6 + rnd() * 22
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    // Village zone
    if (z > 3 && z < 20 && x > -12 && x < 11) continue
    // Castle hill + mountains
    if (z < -8 && x > -18 && x < 15) continue
    // River band
    if (x > 7 && x < 18 && z > -12 && z < 12) continue
    // Ruins
    if (Math.hypot(x + 17, z - 10) < 6) continue
    // Windmills / towers
    if (Math.hypot(x + 14, z) < 4 || Math.hypot(x - 16, z - 14) < 4) continue
    if (Math.hypot(x - 22, z - 4) < 3.5 || Math.hypot(x + 22, z + 4) < 3.5) continue
    spots.push({ x, z, s: 0.7 + rnd() * 0.9 })
  }
  return spots
}

/** Dense instanced forest with gentle wind sway on the foliage. */
export function Forest() {
  const foliage = useRef<THREE.InstancedMesh>(null)
  const trunks = useRef<THREE.InstancedMesh>(null)
  const spots = useMemo(() => treeSpots(140, 11), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colors = useMemo(() => {
    const rnd = mulberry32(5)
    const palette = ['#4e8c3a', '#5f9e46', '#6fae52', '#7fb85e', '#8f9e3a']
    return spots.map(() => new THREE.Color(palette[Math.floor(rnd() * palette.length)]))
  }, [spots])

  useLayoutEffect(() => {
    if (!trunks.current || !foliage.current) return
    spots.forEach((p, i) => {
      dummy.position.set(p.x, 2.6 + 0.7 * p.s, p.z)
      dummy.scale.setScalar(p.s)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      trunks.current!.setMatrixAt(i, dummy.matrix)
      foliage.current!.setColorAt(i, colors[i])
    })
    trunks.current.instanceMatrix.needsUpdate = true
    if (foliage.current.instanceColor) foliage.current.instanceColor.needsUpdate = true
  }, [spots, colors, dummy])

  useFrame(({ clock }) => {
    if (!foliage.current) return
    const t = clock.getElapsedTime()
    spots.forEach((p, i) => {
      const sway = Math.sin(t * 1.1 + p.x * 0.7 + p.z * 0.5) * 0.045
      dummy.position.set(p.x, 2.6 + (0.7 + 1.35) * p.s, p.z)
      dummy.scale.setScalar(p.s)
      dummy.rotation.set(sway, 0, sway * 0.8)
      dummy.updateMatrix()
      foliage.current!.setMatrixAt(i, dummy.matrix)
    })
    foliage.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, spots.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.16, 0.24, 1.4, 6]} />
        <meshStandardMaterial color={'#6b4a2f'} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={foliage} args={[undefined, undefined, spots.length]} castShadow frustumCulled={false}>
        <coneGeometry args={[1.15, 2.6, 7]} />
        <meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
    </group>
  )
}

/** Swaying grass tufts near the village and paths. */
export function Grass() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const spots = useMemo(() => {
    const rnd = mulberry32(42)
    return Array.from({ length: 220 }, () => {
      const a = rnd() * Math.PI * 2
      const r = 4 + rnd() * 24
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, p: rnd() * Math.PI * 2, s: 0.6 + rnd() * 0.7 }
    })
  }, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    spots.forEach((p, i) => {
      dummy.position.set(p.x, 2.75, p.z)
      dummy.rotation.set(0, p.p, Math.sin(t * 2 + p.p) * 0.18)
      dummy.scale.set(p.s, p.s, p.s)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, spots.length]} frustumCulled={false}>
      <coneGeometry args={[0.1, 0.7, 4]} />
      <meshStandardMaterial color={'#83bd60'} roughness={1} />
    </instancedMesh>
  )
}

/** A flock of birds circling the island with flapping wings. */
export function Birds() {
  const flock = useRef<THREE.Group>(null)
  const wings = useRef<THREE.Mesh[]>([])
  const birds = useMemo(() => {
    const rnd = mulberry32(9)
    return Array.from({ length: 7 }, (_, i) => ({
      radius: 30 + rnd() * 14,
      height: 18 + rnd() * 9,
      speed: 0.14 + rnd() * 0.08,
      offset: (i / 7) * Math.PI * 2 + rnd(),
      flap: 6 + rnd() * 4,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!flock.current) return
    const t = clock.getElapsedTime()
    flock.current.children.forEach((bird, i) => {
      const b = birds[i]
      const a = t * b.speed + b.offset
      bird.position.set(Math.cos(a) * b.radius, b.height + Math.sin(t * 0.7 + i) * 1.4, Math.sin(a) * b.radius)
      bird.rotation.y = -a - Math.PI / 2
      const flap = Math.sin(t * b.flap + i) * 0.55
      const [l, r] = bird.children as THREE.Mesh[]
      if (l && r) {
        l.rotation.z = flap
        r.rotation.z = -flap
      }
    })
  })
  void wings

  return (
    <group ref={flock}>
      {birds.map((_, i) => (
        <group key={i}>
          <mesh position={[-0.45, 0, 0]}>
            <boxGeometry args={[0.9, 0.04, 0.28]} />
            <meshStandardMaterial color={'#3d3d3d'} />
          </mesh>
          <mesh position={[0.45, 0, 0]}>
            <boxGeometry args={[0.9, 0.04, 0.28]} />
            <meshStandardMaterial color={'#3d3d3d'} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Golden leaves and motes drifting through the air. */
export function FloatingLeaves() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const leaves = useMemo(() => {
    const rnd = mulberry32(77)
    return Array.from({ length: 60 }, () => ({
      x: (rnd() - 0.5) * 70,
      y: 4 + rnd() * 20,
      z: (rnd() - 0.5) * 70,
      p: rnd() * Math.PI * 2,
      s: 0.08 + rnd() * 0.1,
    }))
  }, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    leaves.forEach((l, i) => {
      dummy.position.set(
        l.x + Math.sin(t * 0.4 + l.p) * 4,
        l.y + Math.sin(t * 0.6 + l.p * 2) * 2,
        l.z + Math.cos(t * 0.3 + l.p) * 4
      )
      dummy.rotation.set(t * 0.8 + l.p, t * 0.5, t * 0.6 + l.p)
      dummy.scale.setScalar(l.s)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, leaves.length]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={'#d9b45a'} side={THREE.DoubleSide} transparent opacity={0.85} />
    </instancedMesh>
  )
}

/** Soft cloud shadows drifting across the terrain. */
export function CloudShadows() {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const clouds = useMemo(
    () => [
      { r: 9, speed: 0.6, offset: 0 },
      { r: 12, speed: 0.45, offset: 2.5 },
      { r: 7, speed: 0.8, offset: 5 },
    ],
    []
  )
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((m, i) => {
      if (!m) return
      const c = clouds[i]
      m.position.x = Math.sin(t * 0.04 * c.speed * 5 + c.offset) * 24
      m.position.z = Math.cos(t * 0.03 * c.speed * 5 + c.offset * 1.7) * 22
    })
  })
  return (
    <group>
      {clouds.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[0, 2.72, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[c.r, 20]} />
          <meshBasicMaterial color={'#1a2b3d'} transparent opacity={0.07} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
