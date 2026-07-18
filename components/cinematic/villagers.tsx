'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* Living-world layer: villagers, children, blacksmith, farmer with cart,
   horse, dog, chickens, cats, butterflies and street dressing.
   Every animation is phase-offset so nothing loops in obvious sync. */

const SKIN = '#e8c39e'
const WOOD_DARK = '#6b4a2f'
const CLOTH = ['#8c5a3c', '#5c7a4a', '#7a5c8c', '#a8563e', '#4a6a7a', '#9c7a4a']

/** Approximate ground height on the island (village tier vs lower plateau). */
function groundY(x: number, z: number) {
  const d = Math.hypot(x + 4, z + 6)
  if (d < 18.4) return 4.03
  if (d > 19.6) return 2.63
  return 4.03 + (2.63 - 4.03) * ((d - 18.4) / 1.2)
}

/* ---------------- Low-poly person ---------------- */

function Person({
  tunic = CLOTH[0],
  scale = 1,
  carrying = false,
}: {
  tunic?: string
  scale?: number
  carrying?: boolean
}) {
  return (
    <group scale={scale}>
      {/* legs */}
      <mesh name="legL" position={[-0.09, 0.22, 0]}>
        <boxGeometry args={[0.13, 0.44, 0.14]} />
        <meshStandardMaterial color={'#4a3a2c'} roughness={1} />
      </mesh>
      <mesh name="legR" position={[0.09, 0.22, 0]}>
        <boxGeometry args={[0.13, 0.44, 0.14]} />
        <meshStandardMaterial color={'#4a3a2c'} roughness={1} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 0.66, 0]} castShadow>
        <boxGeometry args={[0.34, 0.48, 0.22]} />
        <meshStandardMaterial color={tunic} roughness={1} />
      </mesh>
      {/* arms */}
      <mesh name="armL" position={[-0.23, 0.66, carrying ? 0.1 : 0]} rotation={carrying ? [-0.9, 0, 0] : [0, 0, 0]}>
        <boxGeometry args={[0.1, 0.42, 0.11]} />
        <meshStandardMaterial color={tunic} roughness={1} />
      </mesh>
      <mesh name="armR" position={[0.23, 0.66, carrying ? 0.1 : 0]} rotation={carrying ? [-0.9, 0, 0] : [0, 0, 0]}>
        <boxGeometry args={[0.1, 0.42, 0.11]} />
        <meshStandardMaterial color={tunic} roughness={1} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color={SKIN} roughness={1} />
      </mesh>
      {carrying && (
        <mesh position={[0, 0.72, 0.28]}>
          <boxGeometry args={[0.4, 0.28, 0.3]} />
          <meshStandardMaterial color={'#8a6240'} roughness={1} />
        </mesh>
      )}
    </group>
  )
}

/** Walks back and forth along the main street with a natural gait. */
function Walker({
  x,
  zFrom,
  zTo,
  speed,
  phase,
  tunic,
  scale = 1,
  carrying = false,
}: {
  x: number
  zFrom: number
  zTo: number
  speed: number
  phase: number
  tunic: string
  scale?: number
  carrying?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.getElapsedTime() * speed + phase
    // Triangle wave 0..1..0 with a soft turnaround
    const cyc = t % 2
    const k = cyc < 1 ? cyc : 2 - cyc
    const s = k * k * (3 - 2 * k)
    const z = zFrom + (zTo - zFrom) * s
    const wob = Math.sin(t * 9.3) // gait frequency
    const xNow = x + Math.sin(t * 0.7) * 0.35
    g.position.set(xNow, groundY(xNow, z) + Math.abs(wob) * 0.03, z)
    g.rotation.y = cyc < 1 ? Math.PI : 0 // face travel direction (+z when returning)
    if (zTo < zFrom) g.rotation.y += Math.PI
    // leg + arm swing
    const legL = g.getObjectByName('legL')
    const legR = g.getObjectByName('legR')
    const armL = g.getObjectByName('armL')
    const armR = g.getObjectByName('armR')
    if (legL) legL.rotation.x = wob * 0.55
    if (legR) legR.rotation.x = -wob * 0.55
    if (armL && !carrying) armL.rotation.x = -wob * 0.4
    if (armR && !carrying) armR.rotation.x = wob * 0.4
  })
  return (
    <group ref={group}>
      <Person tunic={tunic} scale={scale} carrying={carrying} />
    </group>
  )
}

/** Two villagers standing face-to-face, chatting with small gestures. */
function Talkers({ position }: { position: [number, number, number] }) {
  const a = useRef<THREE.Group>(null)
  const b = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (a.current) {
      const arm = a.current.getObjectByName('armR')
      if (arm) arm.rotation.x = -0.5 + Math.sin(t * 1.7) * 0.3
      a.current.position.y = Math.sin(t * 1.1) * 0.01
    }
    if (b.current) {
      const arm = b.current.getObjectByName('armL')
      if (arm) arm.rotation.x = -0.3 + Math.sin(t * 1.3 + 2) * 0.25
      b.current.rotation.y = Math.PI + Math.sin(t * 0.4) * 0.06
    }
  })
  return (
    <group position={position}>
      <group ref={a} position={[0, 0, 0.35]}>
        <Person tunic={CLOTH[2]} />
      </group>
      <group ref={b} position={[0.1, 0, -0.35]} rotation={[0, Math.PI, 0]}>
        <Person tunic={CLOTH[4]} />
      </group>
    </group>
  )
}

/* ---------------- Blacksmith ---------------- */

function Blacksmith({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const arm = useRef<THREE.Mesh>(null)
  const spark = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Hammer: raise slowly, strike fast
    const cyc = (t * 0.9) % 1
    const swing = cyc < 0.7 ? (cyc / 0.7) * 1.4 : 1.4 * (1 - (cyc - 0.7) / 0.3)
    if (arm.current) arm.current.rotation.x = -0.3 - swing
    if (spark.current) {
      const hit = cyc > 0.96 || cyc < 0.06
      spark.current.visible = hit
      spark.current.scale.setScalar(hit ? 0.6 + Math.random() * 0.5 : 0.01)
    }
  })
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Person tunic={'#3e3a36'} />
      {/* hammer arm overrides */}
      <mesh ref={arm} position={[0.23, 0.86, 0]}>
        <group>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.09, 0.5, 0.09]} />
            <meshStandardMaterial color={'#3e3a36'} roughness={1} />
          </mesh>
          <mesh position={[0, -0.55, 0]}>
            <boxGeometry args={[0.2, 0.12, 0.12]} />
            <meshStandardMaterial color={'#777470'} metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
        <boxGeometry args={[0.001, 0.001, 0.001]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* anvil */}
      <group position={[0, 0, 0.55]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.24, 0.4, 0.24]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
        <mesh position={[0, 0.46, 0]} castShadow>
          <boxGeometry args={[0.5, 0.14, 0.2]} />
          <meshStandardMaterial color={'#55524e'} metalness={0.6} roughness={0.45} />
        </mesh>
        <mesh ref={spark} position={[0, 0.58, 0]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={'#ffcf5e'} emissive={'#ffae2b'} emissiveIntensity={4} transparent opacity={0.9} />
        </mesh>
      </group>
      {/* forge glow */}
      <mesh position={[-0.5, 0.25, 0.5]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={'#4b423a'} roughness={1} />
      </mesh>
      <mesh position={[-0.5, 0.42, 0.72]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial color={'#ff9a3c'} emissive={'#ff6a1f'} emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

/* ---------------- Farmer + cart ---------------- */

function FarmerCart() {
  const group = useRef<THREE.Group>(null)
  const wheels = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.getElapsedTime() * 0.13
    const cyc = t % 2
    const k = cyc < 1 ? cyc : 2 - cyc
    const s = k * k * (3 - 2 * k)
    const z = 19.5 - s * 9
    const x = 2.4
    g.position.set(x, groundY(x, z), z)
    g.rotation.y = cyc < 1 ? Math.PI : 0
    wheels.current.forEach((w) => {
      if (w) w.rotation.x += 0.02
    })
    const legL = g.getObjectByName('legL')
    const legR = g.getObjectByName('legR')
    const wob = Math.sin(clock.getElapsedTime() * 5.2)
    if (legL) legL.rotation.x = wob * 0.4
    if (legR) legR.rotation.x = -wob * 0.4
  })
  return (
    <group ref={group}>
      <Person tunic={CLOTH[1]} />
      {/* cart behind */}
      <group position={[0, 0.3, -0.9]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.7, 0.3, 0.9]} />
          <meshStandardMaterial color={'#8a6240'} roughness={1} />
        </mesh>
        {/* hay */}
        <mesh position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.3, 6, 5]} />
          <meshStandardMaterial color={'#d8b45a'} flatShading roughness={1} />
        </mesh>
        {[-0.4, 0.4].map((x, i) => (
          <mesh
            key={i}
            ref={(el) => {
              wheels.current[i] = el
            }}
            position={[x, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.24, 0.24, 0.08, 10]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={1} />
          </mesh>
        ))}
        {/* handles */}
        <mesh position={[0.2, 0.28, 0.62]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 5]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
        <mesh position={[-0.2, 0.28, 0.62]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 5]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

/* ---------------- Horse ---------------- */

function Horse() {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.getElapsedTime() * 0.055
    const a = (t % 1) * Math.PI * 2
    const x = 1 + Math.sin(a) * 5.5
    const z = 13.5 + Math.cos(a) * 4.5
    g.position.set(x, groundY(x, z), z)
    g.rotation.y = Math.atan2(Math.cos(a) * 5.5, -Math.sin(a) * 4.5)
    // head bob + leg trot
    const w = Math.sin(clock.getElapsedTime() * 4.6)
    const head = g.getObjectByName('head')
    if (head) head.rotation.x = 0.25 + w * 0.06
    ;['fl', 'fr', 'bl', 'br'].forEach((n, i) => {
      const leg = g.getObjectByName(n)
      if (leg) leg.rotation.x = Math.sin(clock.getElapsedTime() * 4.6 + (i % 2) * Math.PI) * 0.35
    })
  })
  return (
    <group ref={group}>
      {/* body */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.42, 0.42, 1.05]} />
        <meshStandardMaterial color={'#6e4a30'} roughness={1} />
      </mesh>
      {/* neck + head */}
      <group name="head" position={[0, 0.95, 0.5]}>
        <mesh position={[0, 0.2, 0.08]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.2, 0.45, 0.22]} />
          <meshStandardMaterial color={'#6e4a30'} roughness={1} />
        </mesh>
        <mesh position={[0, 0.42, 0.28]}>
          <boxGeometry args={[0.17, 0.2, 0.4]} />
          <meshStandardMaterial color={'#5d3d26'} roughness={1} />
        </mesh>
      </group>
      {/* tail */}
      <mesh position={[0, 0.8, -0.6]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.07, 0.45, 6]} />
        <meshStandardMaterial color={'#3d2a1a'} roughness={1} />
      </mesh>
      {/* legs */}
      {(
        [
          ['fl', -0.14, 0.42],
          ['fr', 0.14, 0.42],
          ['bl', -0.14, -0.42],
          ['br', 0.14, -0.42],
        ] as const
      ).map(([n, x, z]) => (
        <mesh key={n} name={n} position={[x, 0.3, z]}>
          <boxGeometry args={[0.11, 0.6, 0.12]} />
          <meshStandardMaterial color={'#5d3d26'} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Dog following a villager ---------------- */

function Dog() {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    // Trails the walker on x=-1.2 street lane, slightly behind and weaving
    const t = clock.getElapsedTime() * 0.16 + 0.35
    const cyc = t % 2
    const k = cyc < 1 ? cyc : 2 - cyc
    const s = k * k * (3 - 2 * k)
    const z = 18.5 + (7.5 - 18.5) * s + 0.9
    const x = -1.2 + Math.sin(clock.getElapsedTime() * 1.4) * 0.5
    g.position.set(x, groundY(x, z) + Math.abs(Math.sin(clock.getElapsedTime() * 7)) * 0.04, z)
    g.rotation.y = cyc < 1 ? Math.PI : 0
    const tail = g.getObjectByName('tail')
    if (tail) tail.rotation.z = Math.sin(clock.getElapsedTime() * 9) * 0.4
  })
  return (
    <group ref={group}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.18, 0.2, 0.45]} />
        <meshStandardMaterial color={'#9c8468'} roughness={1} />
      </mesh>
      <mesh position={[0, 0.34, 0.26]}>
        <boxGeometry args={[0.15, 0.15, 0.18]} />
        <meshStandardMaterial color={'#8a7358'} roughness={1} />
      </mesh>
      <mesh name="tail" position={[0, 0.32, -0.26]} rotation={[0.7, 0, 0]}>
        <coneGeometry args={[0.035, 0.22, 5]} />
        <meshStandardMaterial color={'#8a7358'} roughness={1} />
      </mesh>
      {[
        [-0.06, 0.16],
        [0.06, 0.16],
        [-0.06, -0.16],
        [0.06, -0.16],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.07, p[1]]}>
          <boxGeometry args={[0.05, 0.14, 0.05]} />
          <meshStandardMaterial color={'#8a7358'} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Chickens ---------------- */

function Chicken({ home, phase }: { home: [number, number]; phase: number }) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.getElapsedTime() * 0.4 + phase
    const x = home[0] + Math.sin(t * 0.8) * 0.9 + Math.sin(t * 2.3) * 0.2
    const z = home[1] + Math.cos(t * 0.6) * 0.9
    // pecking: head dips periodically
    const peck = Math.max(0, Math.sin(t * 3.1 + phase)) ** 6
    g.position.set(x, groundY(x, z), z)
    g.rotation.y = t * 0.8
    const head = g.getObjectByName('chead')
    if (head) head.position.y = 0.24 - peck * 0.1
  })
  return (
    <group ref={group} scale={0.75}>
      <mesh position={[0, 0.13, 0]} castShadow>
        <sphereGeometry args={[0.11, 7, 6]} />
        <meshStandardMaterial color={'#f5f0e6'} roughness={1} />
      </mesh>
      <group name="chead" position={[0, 0.24, 0.07]}>
        <mesh>
          <sphereGeometry args={[0.055, 6, 6]} />
          <meshStandardMaterial color={'#f5f0e6'} roughness={1} />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.04]} />
          <meshStandardMaterial color={'#c9483a'} roughness={1} />
        </mesh>
        <mesh position={[0, -0.005, 0.06]}>
          <coneGeometry args={[0.02, 0.05, 4]} />
          <meshStandardMaterial color={'#e3a23c'} roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

/* ---------------- Resting cat ---------------- */

function Cat({ position }: { position: [number, number, number] }) {
  const tail = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (tail.current) tail.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.9) * 0.5
  })
  return (
    <group position={position} scale={0.8}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.14, 7, 6]} />
        <meshStandardMaterial color={'#55524e'} roughness={1} />
      </mesh>
      <mesh position={[0.08, 0.18, 0.06]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color={'#55524e'} roughness={1} />
      </mesh>
      {[-0.03, 0.03].map((x, i) => (
        <mesh key={i} position={[0.08 + x, 0.26, 0.06]}>
          <coneGeometry args={[0.02, 0.05, 4]} />
          <meshStandardMaterial color={'#454340'} roughness={1} />
        </mesh>
      ))}
      <mesh ref={tail} position={[-0.13, 0.08, -0.02]} rotation={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.02, 0.03, 0.3, 5]} />
        <meshStandardMaterial color={'#454340'} roughness={1} />
      </mesh>
    </group>
  )
}

/* ---------------- Butterflies ---------------- */

function Butterflies() {
  const group = useRef<THREE.Group>(null)
  const items = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        cx: -14 + (i % 3) * 11 + Math.sin(i * 3.7) * 3,
        cz: 6 + (i % 4) * 3,
        r: 0.8 + (i % 3) * 0.5,
        speed: 0.5 + (i % 3) * 0.2,
        phase: i * 1.9,
        color: i % 2 === 0 ? '#e8b44a' : '#d97a5a',
      })),
    []
  )
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.getElapsedTime()
    g.children.forEach((b, i) => {
      const it = items[i]
      const a = t * it.speed + it.phase
      const x = it.cx + Math.sin(a) * it.r + Math.sin(a * 2.7) * 0.3
      const z = it.cz + Math.cos(a * 0.8) * it.r
      b.position.set(x, groundY(x, z) + 0.7 + Math.sin(a * 1.7) * 0.3, z)
      b.rotation.y = a
      // wing flap
      const flap = Math.sin(t * 14 + it.phase) * 0.8
      const wl = b.children[0]
      const wr = b.children[1]
      if (wl) wl.rotation.z = flap
      if (wr) wr.rotation.z = -flap
    })
  })
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group key={i}>
          <mesh position={[-0.04, 0, 0]}>
            <planeGeometry args={[0.09, 0.07]} />
            <meshStandardMaterial color={it.color} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <planeGeometry args={[0.09, 0.07]} />
            <meshStandardMaterial color={it.color} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------------- Street dressing: banners + crates ---------------- */

function StreetDressing() {
  const banner = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (banner.current) {
      const t = clock.getElapsedTime()
      banner.current.rotation.x = Math.sin(t * 1.6) * 0.12
      banner.current.position.y = 6.15 + Math.sin(t * 1.1) * 0.05
    }
  })
  return (
    <group>
      {/* Banner strung across the street the camera flies beneath */}
      <group position={[0, 0, 12]}>
        {[-3.2, 3.2].map((x, i) => (
          <mesh key={i} position={[x, groundY(x, 12) + 2.2, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 4.4, 6]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={1} />
          </mesh>
        ))}
        <mesh ref={banner} position={[0, 6.15, 0]}>
          <planeGeometry args={[6.4, 0.5, 8, 1]} />
          <meshStandardMaterial color={'#a8563e'} side={THREE.DoubleSide} roughness={1} />
        </mesh>
      </group>
      {/* Crates and barrels near houses */}
      {(
        [
          [-4.6, 8.2, 0.3],
          [4.8, 10.5, 0.8],
          [-6.4, 12.6, 1.6],
        ] as const
      ).map(([x, z, r], i) => (
        <group key={i} position={[x, groundY(x, z), z]} rotation={[0, r, 0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.44, 0.44, 0.44]} />
            <meshStandardMaterial color={'#8a6240'} roughness={1} />
          </mesh>
          <mesh position={[0.5, 0.3, 0.1]} castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.6, 9]} />
            <meshStandardMaterial color={'#6b4a2f'} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------------- Export ---------------- */

export function Villagers() {
  return (
    <group>
      {/* Adults walking the main street */}
      <Walker x={-1.2} zFrom={18.5} zTo={7.5} speed={0.16} phase={0} tunic={CLOTH[0]} />
      <Walker x={0.6} zFrom={8} zTo={19} speed={0.12} phase={1.2} tunic={CLOTH[3]} />
      <Walker x={1.6} zFrom={16} zTo={6.5} speed={0.14} phase={2.6} tunic={CLOTH[5]} carrying />
      <Walker x={-0.4} zFrom={20} zTo={9} speed={0.1} phase={4.1} tunic={CLOTH[1]} />
      {/* Children darting around */}
      <Walker x={-2} zFrom={15} zTo={9} speed={0.34} phase={0.7} tunic={'#c98a3c'} scale={0.62} />
      <Walker x={2.6} zFrom={14} zTo={8.5} speed={0.3} phase={2.2} tunic={'#7a9c5a'} scale={0.58} />

      <Talkers position={[3.6, groundY(3.6, 10.6), 10.6]} />
      <Blacksmith position={[-5.4, groundY(-5.4, 9.4), 9.4]} rotation={0.9} />
      <FarmerCart />
      <Horse />
      <Dog />

      <Chicken home={[5.2, 13.8]} phase={0} />
      <Chicken home={[5.8, 14.6]} phase={2.4} />
      <Chicken home={[-7.2, 14]} phase={4.8} />
      <Cat position={[6.8, groundY(6.8, 11.6), 11.6]} />
      <Cat position={[-8.6, groundY(-8.6, 12.4), 12.4]} />

      <Butterflies />
      <StreetDressing />
    </group>
  )
}
