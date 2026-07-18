'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* Deterministic pseudo-random so the island looks the same every visit */
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

const GRASS = '#6fae52'
const GRASS_DARK = '#588f42'
const ROCK = '#8d8578'
const ROCK_DARK = '#6e675c'
const SAND = '#e5d3a1'
const WOOD = '#8a6240'
const WOOD_DARK = '#6b4a2f'
const PLASTER = '#f0e6d2'
const ROOF = '#b5533c'
const ROOF_ALT = '#7d8a5c'
const STONE = '#a8a29a'
const SNOW = '#f5f2ec'
const WATER_RIVER = '#5fc3d4'

/* ---------------- Terrain ---------------- */

function Terrain() {
  const rocks = useMemo(() => {
    const rnd = mulberry32(7)
    const items: { pos: [number, number, number]; scale: [number, number, number]; rot: number }[] = []
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + rnd() * 0.3
      const r = 29 + rnd() * 3
      items.push({
        pos: [Math.cos(a) * r, 0.5 + rnd() * 1.5, Math.sin(a) * r * 1.05],
        scale: [2 + rnd() * 3, 2.5 + rnd() * 3.5, 2 + rnd() * 3],
        rot: rnd() * Math.PI,
      })
    }
    return items
  }, [])

  return (
    <group>
      {/* Sandy shore ring */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[33, 35, 0.6, 48]} />
        <meshStandardMaterial color={SAND} roughness={1} />
      </mesh>
      {/* Main grass plateau */}
      <mesh position={[0, 1.4, 0]} receiveShadow>
        <cylinderGeometry args={[30, 32.5, 2.4, 48]} />
        <meshStandardMaterial color={GRASS} roughness={1} />
      </mesh>
      {/* Second tier */}
      <mesh position={[-4, 3.1, -6]} receiveShadow>
        <cylinderGeometry args={[19, 23, 1.8, 40]} />
        <meshStandardMaterial color={GRASS_DARK} roughness={1} />
      </mesh>
      {/* Castle hill */}
      <mesh position={[0, 5, -14]} receiveShadow>
        <cylinderGeometry args={[8.5, 13, 4.5, 32]} />
        <meshStandardMaterial color={GRASS_DARK} roughness={1} />
      </mesh>
      {/* Cliff rocks around the rim */}
      {rocks.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={[0, r.rot, 0]} scale={r.scale} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 3 === 0 ? ROCK_DARK : ROCK} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Mountains ---------------- */

function Mountains() {
  const peaks: { pos: [number, number, number]; h: number; r: number; snow: boolean }[] = [
    { pos: [-14, 2.6, -20], h: 17, r: 7.5, snow: true },
    { pos: [-7, 2.6, -24], h: 22, r: 8.5, snow: true },
    { pos: [3, 2.6, -25], h: 15, r: 6.5, snow: true },
    { pos: [12, 2.6, -21], h: 11, r: 5.5, snow: false },
    { pos: [-20, 2.6, -13], h: 9, r: 4.5, snow: false },
  ]
  return (
    <group>
      {peaks.map((p, i) => (
        <group key={i} position={p.pos}>
          <mesh castShadow receiveShadow>
            <coneGeometry args={[p.r, p.h, 7]} />
            <meshStandardMaterial color={ROCK} flatShading roughness={1} />
          </mesh>
          {p.snow && (
            <mesh position={[0, p.h * 0.33, 0]}>
              <coneGeometry args={[p.r * 0.34, p.h * 0.36, 7]} />
              <meshStandardMaterial color={SNOW} flatShading roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/* ---------------- Animated flag ---------------- */

function Flag({ position, color = '#c9483a' }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Mesh>(null)
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.y = Math.sin(t * 2.4 + phase) * 0.35
    ref.current.scale.x = 0.85 + Math.sin(t * 5 + phase) * 0.15
  })
  return (
    <group position={position}>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.9, 6]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh ref={ref} position={[0.45, -0.25, 0]}>
        <planeGeometry args={[0.9, 0.55]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ---------------- Castle ---------------- */

function CastleTower({
  position,
  height = 6,
  radius = 1.1,
  flag = false,
}: {
  position: [number, number, number]
  height?: number
  radius?: number
  flag?: boolean
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, radius * 1.15, height, 10]} />
        <meshStandardMaterial color={STONE} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, height + 0.9, 0]} castShadow>
        <coneGeometry args={[radius * 1.35, 2.2, 10]} />
        <meshStandardMaterial color={'#3f5d8c'} flatShading roughness={0.9} />
      </mesh>
      {flag && <Flag position={[0, height + 3, 0]} color={'#e3b458'} />}
    </group>
  )
}

function Castle() {
  return (
    <group position={[0, 7.2, -14]}>
      {/* Keep */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[6, 6.4, 5]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      <mesh position={[0, 7.4, 0]} castShadow>
        <coneGeometry args={[4.4, 2.6, 4]} />
        <meshStandardMaterial color={'#3f5d8c'} flatShading />
      </mesh>
      {/* Curtain walls */}
      <mesh position={[0, 1.4, 3.4]} castShadow>
        <boxGeometry args={[11, 2.8, 0.9]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      <mesh position={[-5.2, 1.4, 0]} castShadow>
        <boxGeometry args={[0.9, 2.8, 7.6]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      <mesh position={[5.2, 1.4, 0]} castShadow>
        <boxGeometry args={[0.9, 2.8, 7.6]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      {/* Corner towers */}
      <CastleTower position={[-5.2, 0, 3.4]} height={5} flag />
      <CastleTower position={[5.2, 0, 3.4]} height={5} flag />
      <CastleTower position={[-5.2, 0, -3.2]} height={6.5} />
      <CastleTower position={[5.2, 0, -3.2]} height={6.5} />
      <CastleTower position={[0, 0, -0.2]} height={9.5} radius={1.4} flag />
      {/* Gate */}
      <mesh position={[0, 1.1, 3.5]}>
        <boxGeometry args={[1.8, 2.2, 1.1]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      {/* Windows glow */}
      {[
        [-1.6, 4.2, 2.55],
        [1.6, 4.2, 2.55],
        [0, 5.4, 2.55],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <planeGeometry args={[0.5, 0.8]} />
          <meshStandardMaterial color={'#ffd98a'} emissive={'#ffb84d'} emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Chimney smoke ---------------- */

function Smoke({ position }: { position: [number, number, number] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const phase = useMemo(() => Math.random() * 10, [])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase
    refs.current.forEach((m, i) => {
      if (!m) return
      const k = ((t * 0.35 + i * 0.33) % 1 + 1) % 1
      m.position.y = k * 3.2
      m.position.x = Math.sin(t * 0.8 + i) * 0.25 + k * 0.5
      const s = 0.18 + k * 0.5
      m.scale.setScalar(s)
      const mat = m.material as THREE.MeshStandardMaterial
      mat.opacity = (1 - k) * 0.45
    })
  })
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={'#f2ede3'} transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Village ---------------- */

function House({
  position,
  rotation = 0,
  size = 1,
  roof = ROOF,
  smoke = false,
}: {
  position: [number, number, number]
  rotation?: number
  size?: number
  roof?: string
  smoke?: boolean
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={size}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[2.2, 1.6, 1.8]} />
        <meshStandardMaterial color={PLASTER} roughness={1} />
      </mesh>
      {/* Timber base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.3, 0.42, 1.9]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.9, 1.3, 4]} />
        <meshStandardMaterial color={roof} flatShading roughness={1} />
      </mesh>
      {/* Door + window */}
      <mesh position={[0, 0.55, 0.92]}>
        <planeGeometry args={[0.45, 0.85]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[0.7, 1, 0.92]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial color={'#ffd98a'} emissive={'#ffb84d'} emissiveIntensity={0.9} />
      </mesh>
      {/* Chimney */}
      <mesh position={[0.6, 2.3, -0.3]}>
        <boxGeometry args={[0.32, 0.9, 0.32]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      {smoke && <Smoke position={[0.6, 2.8, -0.3]} />}
    </group>
  )
}

function Village() {
  const houses: {
    pos: [number, number, number]
    rot: number
    size: number
    roof: string
    smoke: boolean
  }[] = [
    { pos: [-6, 2.6, 8], rot: 0.4, size: 1.1, roof: ROOF, smoke: true },
    { pos: [-2.5, 2.6, 11], rot: -0.2, size: 1, roof: ROOF_ALT, smoke: false },
    { pos: [2, 2.6, 9], rot: 0.9, size: 1.2, roof: ROOF, smoke: true },
    { pos: [6, 2.6, 12], rot: -0.6, size: 0.95, roof: ROOF, smoke: false },
    { pos: [-8, 2.6, 13], rot: 1.4, size: 0.9, roof: ROOF_ALT, smoke: true },
    { pos: [9, 2.6, 7], rot: 0.1, size: 1.05, roof: ROOF_ALT, smoke: false },
    { pos: [-3, 2.6, 16], rot: 0.7, size: 1, roof: ROOF, smoke: true },
    { pos: [4, 2.6, 17], rot: -1, size: 0.85, roof: ROOF, smoke: false },
    { pos: [-11, 2.6, 5], rot: 2, size: 0.9, roof: ROOF_ALT, smoke: false },
    { pos: [0, 2.6, 5.5], rot: -0.4, size: 1.15, roof: ROOF, smoke: true },
  ]
  return (
    <group>
      {houses.map((h, i) => (
        <House key={i} position={h.pos} rotation={h.rot} size={h.size} roof={h.roof} smoke={h.smoke} />
      ))}
      {/* Village entrance gate */}
      <group position={[1, 2.6, 21]}>
        <mesh position={[-1.6, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.34, 3, 8]} />
          <meshStandardMaterial color={WOOD} roughness={1} />
        </mesh>
        <mesh position={[1.6, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.34, 3, 8]} />
          <meshStandardMaterial color={WOOD} roughness={1} />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <boxGeometry args={[4.4, 0.5, 0.5]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
        <Flag position={[0, 4.4, 0]} />
      </group>
      {/* Dirt path from gate through village */}
      <mesh position={[0.5, 2.63, 14]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <planeGeometry args={[2.2, 16]} />
        <meshStandardMaterial color={'#c9b184'} roughness={1} />
      </mesh>
    </group>
  )
}

/* ---------------- Watchtower ---------------- */

function Watchtower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[1, 1.5, 5.2, 8]} />
        <meshStandardMaterial color={STONE} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 5.5, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 1, 8]} />
        <meshStandardMaterial color={WOOD} roughness={1} />
      </mesh>
      <mesh position={[0, 6.6, 0]} castShadow>
        <coneGeometry args={[1.8, 1.6, 8]} />
        <meshStandardMaterial color={ROOF} flatShading roughness={1} />
      </mesh>
      <Flag position={[0, 8.4, 0]} />
      {/* Torch glow */}
      <pointLight position={[0, 5.6, 0]} color={'#ffb14d'} intensity={4} distance={9} />
    </group>
  )
}

/* ---------------- Windmill ---------------- */

function Windmill({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const blades = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.7
  })
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[1.4, 2, 4.4, 8]} />
        <meshStandardMaterial color={PLASTER} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow>
        <coneGeometry args={[1.7, 1.8, 8]} />
        <meshStandardMaterial color={WOOD_DARK} flatShading roughness={1} />
      </mesh>
      <group ref={blades} position={[0, 4.4, 1.35]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0]}>
            <boxGeometry args={[0.32, 4.6, 0.08]} />
            <meshStandardMaterial color={'#e8dcc0'} roughness={1} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      </group>
    </group>
  )
}

/* ---------------- River, waterfall, bridges ---------------- */

function River() {
  return (
    <group>
      {/* River winding from the mountains to the front-right shore */}
      <mesh position={[10, 2.66, -4]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <planeGeometry args={[2.6, 18]} />
        <meshStandardMaterial color={WATER_RIVER} roughness={0.2} metalness={0.1} transparent opacity={0.9} />
      </mesh>
      <mesh position={[15.5, 1.6, 6]} rotation={[-Math.PI / 2, 0, 0.15]}>
        <planeGeometry args={[2.6, 12]} />
        <meshStandardMaterial color={WATER_RIVER} roughness={0.2} metalness={0.1} transparent opacity={0.9} />
      </mesh>
      {/* Small lake at the mountain base */}
      <mesh position={[6, 2.7, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.5, 24]} />
        <meshStandardMaterial color={'#49b8cc'} roughness={0.15} metalness={0.1} transparent opacity={0.92} />
      </mesh>
    </group>
  )
}

function Waterfall({ position, height = 8, width = 2.4 }: { position: [number, number, number]; height?: number; width?: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float flow = fract(vUv.y * 3.0 + uTime * 1.4);
            float streaks = smoothstep(0.35, 0.0, abs(fract(vUv.x * 6.0 + sin(vUv.y * 8.0) * 0.06) - 0.5));
            float body = 0.55 + flow * 0.35;
            float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
            vec3 col = mix(vec3(0.65, 0.88, 0.95), vec3(1.0), streaks * 0.7);
            gl_FragColor = vec4(col, body * edge * 0.85);
          }
        `,
      }),
    []
  )
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime()
  })
  return (
    <group position={position}>
      <mesh material={material}>
        <planeGeometry args={[width, height, 1, 8]} />
      </mesh>
      {/* Splash pool foam */}
      <mesh position={[0, -height / 2 + 0.15, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[width * 0.8, 16]} />
        <meshStandardMaterial color={'#dff5f8'} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function Bridge({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Arched deck from stone slabs */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={i} position={[x * 0.9, 0.28 + Math.cos((x / 2.4) * Math.PI * 0.5) * 0.45, 0]} castShadow>
          <boxGeometry args={[1, 0.3, 2]} />
          <meshStandardMaterial color={STONE} roughness={1} />
        </mesh>
      ))}
      {/* Rails */}
      {[-0.85, 0.85].map((z, i) => (
        <mesh key={i} position={[0, 1, z]}>
          <boxGeometry args={[4.4, 0.14, 0.14]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Ancient ruins ---------------- */

function Ruins() {
  const rnd = useMemo(() => mulberry32(21), [])
  const cols = useMemo(() => {
    const r = mulberry32(33)
    return [0, 1, 2, 3, 4, 5].map((i) => ({
      a: (i / 6) * Math.PI * 2,
      h: 1.2 + r() * 2.4,
      broken: r() > 0.5,
    }))
  }, [])
  void rnd
  return (
    <group position={[-17, 2.6, 10]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[4.2, 4.5, 0.3, 12]} />
        <meshStandardMaterial color={'#bab2a4'} flatShading roughness={1} />
      </mesh>
      {cols.map((c, i) => (
        <group key={i} position={[Math.cos(c.a) * 3.2, 0, Math.sin(c.a) * 3.2]}>
          <mesh position={[0, c.h / 2 + 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.4, c.h, 8]} />
            <meshStandardMaterial color={'#c5bcac'} flatShading roughness={1} />
          </mesh>
          {c.broken && (
            <mesh position={[0.8, 0.45, 0.5]} rotation={[0.4, 0.3, 1.2]}>
              <cylinderGeometry args={[0.32, 0.36, 1.1, 8]} />
              <meshStandardMaterial color={'#b3aa9a'} flatShading roughness={1} />
            </mesh>
          )}
        </group>
      ))}
      {/* Ancient arch fragment */}
      <mesh position={[0, 2.9, -3.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.6, 0.3, 6, 12, Math.PI]} />
        <meshStandardMaterial color={'#c5bcac'} flatShading roughness={1} />
      </mesh>
    </group>
  )
}

/* ---------------- Docks ---------------- */

function Dock() {
  return (
    <group position={[8, 0.4, 32]}>
      <mesh position={[0, 0.35, 2]} castShadow>
        <boxGeometry args={[2.4, 0.22, 7]} />
        <meshStandardMaterial color={WOOD} roughness={1} />
      </mesh>
      {[
        [-0.9, 0],
        [0.9, 0],
        [-0.9, 4],
        [0.9, 4],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], -0.2, p[1]]}>
          <cylinderGeometry args={[0.14, 0.14, 1.6, 6]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
      {/* Lantern */}
      <mesh position={[1, 1.1, 5]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={'#ffd98a'} emissive={'#ffb84d'} emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

/* ---------------- Full island ---------------- */

export function Island() {
  return (
    <group>
      <Terrain />
      <Mountains />
      <Castle />
      <Village />
      <River />
      <Ruins />
      <Dock />
      <Watchtower position={[22, 2.6, 4]} />
      <Watchtower position={[-22, 2.6, -4]} />
      <Windmill position={[-14, 2.6, 0]} rotation={0.8} />
      <Windmill position={[16, 2.6, 14]} rotation={-0.5} />
      <Bridge position={[11, 2.55, -1]} rotation={0.55} />
      <Bridge position={[15, 2.4, 8]} rotation={0.15} />
      {/* Waterfalls off the island edge into the sea */}
      <Waterfall position={[19.5, -0.5, 12.8]} height={5} width={2.2} />
      {/* Mountain waterfall feeding the lake */}
      <Waterfall position={[3.2, 6.4, -18.2]} height={9} width={2} />
    </group>
  )
}
