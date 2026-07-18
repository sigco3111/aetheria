'use client'

import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { runeGlowAt, STUDY_CENTER } from '@/lib/cinematic'

// Preload so the study is ready long before the camera crosses the door.
useTexture.preload('/textures/ancient-map.png')

/* Scene 3 — "The Ancient Study". A candlelit, centuries-old room hidden
   beneath the world, entered seamlessly through the elder's door.
   Room: 22x9x22 around STUDY_CENTER, floor at y = -60. */

const WOOD = '#6e4a2e'
const WOOD_DARK = '#4d3420'
const WOOD_AGED = '#5c4028'
const STONE = '#6a6158'
const BRASS = '#b08d4a'
const CANDLE = '#ffb45e'
const PARCH = '#d8c396'
const BOOKS = ['#7a3e2e', '#3e5a4a', '#54432e', '#6e5a7a', '#8a6a3a', '#4a3a5c', '#733d3d']

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

/* ---------------- Room shell ---------------- */

function RoomShell() {
  return (
    <group>
      {/* Floor: aged wood planks */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color={'#4a3520'} roughness={1} />
      </mesh>
      {/* Plank seams */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[-9.9 + i * 2.2, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, 22]} />
          <meshStandardMaterial color={'#332415'} roughness={1} />
        </mesh>
      ))}
      {/* Stone walls */}
      <mesh position={[0, 4.5, -11]}>
        <boxGeometry args={[22.4, 9, 0.6]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      <mesh position={[-11, 4.5, 0]}>
        <boxGeometry args={[0.6, 9, 22.4]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      <mesh position={[11, 4.5, 0]}>
        <boxGeometry args={[0.6, 9, 22.4]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      {/* Front wall with the door gap the camera glides through */}
      <mesh position={[-6.5, 4.5, 11]}>
        <boxGeometry args={[9.4, 9, 0.6]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      <mesh position={[6.5, 4.5, 11]}>
        <boxGeometry args={[9.4, 9, 0.6]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      <mesh position={[0, 7.4, 11]}>
        <boxGeometry args={[3.6, 3.2, 0.6]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      {/* Ceiling with heavy beams */}
      <mesh position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22.4, 22.4]} />
        <meshStandardMaterial color={'#3a2c1c'} roughness={1} />
      </mesh>
      {[-7, -2.3, 2.3, 7].map((x, i) => (
        <mesh key={i} position={[x, 8.6, 0]}>
          <boxGeometry args={[0.6, 0.7, 22]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Window + volumetric light shaft ---------------- */

function WindowShaft() {
  const shaft = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
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
            float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
            float fade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.35, vUv.y);
            float drift = 0.85 + 0.15 * sin(uTime * 0.4 + vUv.y * 4.0);
            gl_FragColor = vec4(1.0, 0.85, 0.6, edge * fade * 0.22 * drift);
          }
        `,
      }),
    []
  )
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime()
  })
  return (
    <group>
      {/* Leaded window on the west wall */}
      <mesh position={[-10.65, 5, -3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.2, 3]} />
        <meshStandardMaterial color={'#ffe6b0'} emissive={'#ffcf7d'} emissiveIntensity={1.6} />
      </mesh>
      {/* Mullions */}
      {[-0.55, 0, 0.55].map((o, i) => (
        <mesh key={i} position={[-10.6, 5, -3 + o]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.08, 3]} />
          <meshStandardMaterial color={'#2c2118'} />
        </mesh>
      ))}
      <mesh position={[-10.6, 5, -3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.2, 0.08]} />
        <meshStandardMaterial color={'#2c2118'} />
      </mesh>
      {/* Angled volumetric shaft toward the map table */}
      <mesh ref={shaft} position={[-5.6, 3.4, -1.6]} rotation={[0.1, 0.35, -1.05]} material={material}>
        <planeGeometry args={[2.6, 11]} />
      </mesh>
    </group>
  )
}

/* ---------------- Fireplace ---------------- */

function Fireplace() {
  const flames = useRef<(THREE.Mesh | null)[]>([])
  const light = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    flames.current.forEach((f, i) => {
      if (!f) return
      f.scale.y = 0.8 + Math.sin(t * 7 + i * 2.1) * 0.22 + Math.sin(t * 13 + i) * 0.1
      f.scale.x = 0.9 + Math.sin(t * 9 + i * 1.4) * 0.12
    })
    if (light.current) light.current.intensity = 7 + Math.sin(t * 8.2) * 1.6 + Math.sin(t * 21) * 0.8
  })
  return (
    <group position={[6.5, 0, -10.5]}>
      {/* Stone surround */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[4, 3.2, 1]} />
        <meshStandardMaterial color={'#595047'} roughness={1} />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[4.6, 0.4, 1.2]} />
        <meshStandardMaterial color={WOOD_AGED} roughness={1} />
      </mesh>
      {/* Firebox */}
      <mesh position={[0, 1.05, 0.51]}>
        <planeGeometry args={[2, 1.7]} />
        <meshStandardMaterial color={'#0d0805'} />
      </mesh>
      {/* Logs */}
      <mesh position={[0, 0.35, 0.7]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 6]} />
        <meshStandardMaterial color={'#3a281a'} roughness={1} />
      </mesh>
      {/* Flames */}
      {[-0.4, 0, 0.4].map((x, i) => (
        <mesh
          key={i}
          ref={(el) => {
            flames.current[i] = el
          }}
          position={[x, 0.85, 0.72]}
        >
          <coneGeometry args={[0.22, 0.9, 6]} />
          <meshStandardMaterial
            color={i === 1 ? '#ffd257' : '#ff8a2a'}
            emissive={i === 1 ? '#ffb62b' : '#ff6a14'}
            emissiveIntensity={2.4}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
      <pointLight ref={light} position={[0, 1.4, 1.6]} color={'#ff9a45'} intensity={7} distance={14} decay={2} />
    </group>
  )
}

/* ---------------- Shelves of ancient books ---------------- */

function Bookshelf({ position, rotation = 0, seed }: { position: [number, number, number]; rotation?: number; seed: number }) {
  const books = useMemo(() => {
    const rnd = mulberry32(seed)
    const rows: { x: number; y: number; h: number; w: number; c: string; lean: number }[] = []
    for (let shelf = 0; shelf < 4; shelf++) {
      let x = -1.55
      while (x < 1.5) {
        const w = 0.1 + rnd() * 0.12
        rows.push({
          x: x + w / 2,
          y: 0.75 + shelf * 1.15 + (0.3 + rnd() * 0.25) / 2,
          h: 0.55 + rnd() * 0.35,
          w,
          c: BOOKS[Math.floor(rnd() * BOOKS.length)],
          lean: rnd() > 0.88 ? 0.18 : 0,
        })
        x += w + 0.02 + (rnd() > 0.9 ? 0.2 : 0)
      }
    }
    return rows
  }, [seed])
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 2.6, -0.05]}>
        <boxGeometry args={[3.5, 5.2, 0.5]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      {[0.65, 1.8, 2.95, 4.1].map((y, i) => (
        <mesh key={i} position={[0, y, 0.12]}>
          <boxGeometry args={[3.4, 0.08, 0.42]} />
          <meshStandardMaterial color={WOOD_AGED} roughness={1} />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y - 0.02, 0.14]} rotation={[0, 0, b.lean]}>
          <boxGeometry args={[b.w, b.h, 0.32]} />
          <meshStandardMaterial color={b.c} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Props: globe, telescope, armor, chest... ---------------- */

function Globe({ position }: { position: [number, number, number] }) {
  const sphere = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (sphere.current) sphere.current.rotation.y += dt * 0.08
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.3, 1, 8]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      <mesh ref={sphere} position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.5, 14, 12]} />
        <meshStandardMaterial color={'#8f7648'} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.35, 0]} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[0.58, 0.025, 6, 24]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}

function Telescope({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.45, 0]} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
          <cylinderGeometry args={[0.025, 0.025, 1.1, 5]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]} rotation={[0.7, 0.4, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 1.3, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>
    </group>
  )
}

function ArmorStand({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.45, 0.5, 0.12, 10]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      {/* Cuirass */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.85, 1.05, 0.5]} />
        <meshStandardMaterial color={'#8a8d93'} metalness={0.65} roughness={0.4} />
      </mesh>
      {/* Pauldrons */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 1.95, 0]}>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial color={'#7d8087'} metalness={0.65} roughness={0.4} />
        </mesh>
      ))}
      {/* Helm with plume */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <sphereGeometry args={[0.26, 10, 8]} />
        <meshStandardMaterial color={'#9599a1'} metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[0, 2.32, 0.24]}>
        <planeGeometry args={[0.26, 0.16]} />
        <meshStandardMaterial color={'#14100c'} />
      </mesh>
      <mesh position={[0, 2.62, -0.05]} rotation={[-0.4, 0, 0]}>
        <coneGeometry args={[0.06, 0.4, 6]} />
        <meshStandardMaterial color={'#8a2f28'} roughness={1} />
      </mesh>
    </group>
  )
}

function WallArms({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Round shield */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.08, 16]} />
        <meshStandardMaterial color={'#6e3a2a'} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.04, 6, 20]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Crossed swords */}
      {[0.6, -0.6].map((r, i) => (
        <group key={i} rotation={[Math.PI / 2, 0, r]}>
          <mesh position={[0, 0.35, 0.1]}>
            <boxGeometry args={[0.09, 1.5, 0.03]} />
            <meshStandardMaterial color={'#a7abb2'} metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.5, 0.1]}>
            <boxGeometry args={[0.32, 0.08, 0.05]} />
            <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function TreasureChest({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const coins = useMemo(() => {
    const rnd = mulberry32(101)
    return Array.from({ length: 14 }, () => ({
      x: (rnd() - 0.5) * 0.9,
      z: (rnd() - 0.5) * 0.5,
      y: 0.62 + rnd() * 0.1,
      s: 0.05 + rnd() * 0.03,
      silver: rnd() > 0.7,
    }))
  }, [])
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[1.3, 0.64, 0.8]} />
        <meshStandardMaterial color={WOOD_AGED} roughness={1} />
      </mesh>
      {/* Open lid */}
      <mesh position={[0, 0.72, -0.38]} rotation={[-2.1, 0, 0]}>
        <boxGeometry args={[1.3, 0.5, 0.08]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      {/* Iron bands */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.32, 0]}>
          <boxGeometry args={[0.08, 0.66, 0.84]} />
          <meshStandardMaterial color={'#3c3a38'} metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
      {/* Spilling coins */}
      {coins.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[Math.PI / 2, 0, i]}>
          <cylinderGeometry args={[c.s, c.s, 0.015, 8]} />
          <meshStandardMaterial
            color={c.silver ? '#c9ccd2' : '#e3b458'}
            metalness={0.85}
            roughness={0.25}
            emissive={c.silver ? '#5a5d63' : '#8a6a1e'}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  )
}

function SideDesk({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[2.4, 0.12, 1.1]} />
        <meshStandardMaterial color={WOOD} roughness={1} />
      </mesh>
      {[
        [-1.05, 0.45],
        [1.05, 0.45],
        [-1.05, -0.45],
        [1.05, -0.45],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.45, p[1]]}>
          <boxGeometry args={[0.12, 0.9, 0.12]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
      {/* Open book */}
      {[-0.11, 0.11].map((x, i) => (
        <mesh key={i} position={[x - 0.4, 1.03, 0]} rotation={[0, 0, i === 0 ? 0.08 : -0.08]}>
          <boxGeometry args={[0.24, 0.03, 0.36]} />
          <meshStandardMaterial color={PARCH} roughness={1} />
        </mesh>
      ))}
      {/* Ink bottle + quill */}
      <mesh position={[0.45, 1.08, 0.15]}>
        <cylinderGeometry args={[0.05, 0.07, 0.14, 8]} />
        <meshStandardMaterial color={'#1e2a3a'} roughness={0.3} />
      </mesh>
      <mesh position={[0.55, 1.2, 0.1]} rotation={[0.3, 0, -0.7]}>
        <planeGeometry args={[0.05, 0.35]} />
        <meshStandardMaterial color={'#e8e2d2'} side={THREE.DoubleSide} roughness={1} />
      </mesh>
      {/* Astrolabe */}
      <group position={[-0.85, 1.14, -0.25]}>
        {[0, 0.7, 1.4].map((r, i) => (
          <mesh key={i} rotation={[r, 0.4, 0.3]}>
            <torusGeometry args={[0.14 - i * 0.03, 0.012, 5, 18]} />
            <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* Crystal bottles */}
      {[0.85, 1.02].map((x, i) => (
        <mesh key={i} position={[x, 1.1, -0.28]}>
          <sphereGeometry args={[0.06 + i * 0.02, 7, 6]} />
          <meshStandardMaterial
            color={i === 0 ? '#7db8a8' : '#b87d8f'}
            transparent
            opacity={0.7}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

function ParchmentBarrel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.44, 0.9, 10]} />
        <meshStandardMaterial color={WOOD_AGED} roughness={1} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[Math.sin(i * 1.8) * 0.16, 1.1 + (i % 2) * 0.1, Math.cos(i * 1.8) * 0.16]}
          rotation={[0.2 * (i - 1.5), 0, 0.12 * (i - 1.5)]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.9, 7]} />
          <meshStandardMaterial color={PARCH} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- Candles ---------------- */

function Candle({ position, height = 0.22, phase = 0 }: { position: [number, number, number]; height?: number; phase?: number }) {
  const flame = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase
    if (flame.current) {
      flame.current.scale.setScalar(0.85 + Math.sin(t * 9.3) * 0.14 + Math.sin(t * 17) * 0.07)
      flame.current.position.x = Math.sin(t * 6.1) * 0.008
    }
  })
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.045, height, 7]} />
        <meshStandardMaterial color={'#efe6d0'} roughness={0.9} />
      </mesh>
      <mesh ref={flame} position={[0, height + 0.05, 0]}>
        <coneGeometry args={[0.028, 0.11, 6]} />
        <meshStandardMaterial color={'#ffd873'} emissive={'#ffab2e'} emissiveIntensity={3.2} transparent opacity={0.95} />
      </mesh>
    </group>
  )
}

/* ---------------- The map table ---------------- */

function MapTable({ progress }: { progress: MutableRefObject<{ value: number }> }) {
  const map = useTexture('/textures/ancient-map.png')
  const runeMat = useRef<THREE.ShaderMaterial>(null)
  const tableLight = useRef<THREE.PointLight>(null)

  const runeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uGlow: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uGlow;
          varying vec2 vUv;

          float rune(vec2 p, vec2 c, float seed) {
            vec2 d = p - c;
            float ring = abs(length(d) - 0.045) ;
            float line = min(abs(d.x + d.y), abs(d.x - d.y));
            float mark = min(ring, line * 0.8 + length(d) * 0.35);
            float reveal = 0.5 + 0.5 * sin(uTime * 0.9 + seed * 6.28);
            return smoothstep(0.014, 0.0, mark) * step(length(d), 0.075) * reveal;
          }

          void main() {
            float g = 0.0;
            g += rune(vUv, vec2(0.22, 0.3), 0.1);
            g += rune(vUv, vec2(0.75, 0.24), 0.35);
            g += rune(vUv, vec2(0.62, 0.68), 0.55);
            g += rune(vUv, vec2(0.3, 0.74), 0.8);
            g += rune(vUv, vec2(0.5, 0.47), 0.22);
            // route line tracing between kingdoms
            vec2 a = vec2(0.24, 0.32); vec2 b = vec2(0.61, 0.66);
            vec2 ab = b - a; float h = clamp(dot(vUv - a, ab) / dot(ab, ab), 0.0, 1.0);
            float dist = length(vUv - (a + ab * h));
            float trace = smoothstep(0.006, 0.0, dist) * step(h, fract(uTime * 0.12) * 1.4);
            g += trace * 0.8;
            vec3 col = vec3(1.0, 0.72, 0.3);
            gl_FragColor = vec4(col, g * uGlow * 0.9);
          }
        `,
      }),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const glow = runeGlowAt(progress.current.value)
    runeMaterial.uniforms.uTime.value = t
    runeMaterial.uniforms.uGlow.value = 0.15 + glow * 0.85
    if (tableLight.current) {
      tableLight.current.intensity = 4.5 + Math.sin(t * 7.7) * 0.7 + glow * 3
    }
  })
  void runeMat

  return (
    <group>
      {/* Heavy exploration table */}
      <mesh position={[0, 1.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.24, 3]} />
        <meshStandardMaterial color={WOOD} roughness={0.95} />
      </mesh>
      {[
        [-1.85, 1.25],
        [1.85, 1.25],
        [-1.85, -1.25],
        [1.85, -1.25],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.95, p[1]]}>
          <boxGeometry args={[0.24, 1.9, 0.24]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
      <group
        onClick={() => { window.location.href = '/grand_guild_exchange/index.html' }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        {/* The ancient map — worn parchment with the generated texture */}
        <mesh position={[0, 2.09, 0]} rotation={[-Math.PI / 2, 0, 0.04]}>
          <planeGeometry args={[3.1, 2.3]} />
          <meshStandardMaterial map={map} roughness={0.85} />
        </mesh>
        {/* Curled parchment edges */}
        {[-1.56, 1.56].map((x, i) => (
          <mesh key={i} position={[x * 0.995, 2.11, 0]} rotation={[0, 0, i === 0 ? 0.5 : -0.5]}>
            <cylinderGeometry args={[0.035, 0.035, 2.3, 6, 1, true]} />
            <meshStandardMaterial color={PARCH} roughness={1} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* Animated rune overlay */}
        <mesh position={[0, 2.105, 0]} rotation={[-Math.PI / 2, 0, 0.04]} material={runeMaterial}>
          <planeGeometry args={[3.1, 2.3]} />
        </mesh>
      </group>
      {/* Tiny candles ringing the map */}
      <Candle position={[-1.85, 2.07, -1.2]} phase={0} />
      <Candle position={[1.8, 2.07, -1.15]} phase={1.7} height={0.16} />
      <Candle position={[1.9, 2.07, 1.2]} phase={3.1} />
      <Candle position={[-1.8, 2.07, 1.25]} phase={4.4} height={0.18} />
      {/* Brass compass resting on the map corner */}
      <mesh position={[1.15, 2.12, 0.75]}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Warm candle glow over the table */}
      <pointLight ref={tableLight} position={[0, 3.6, 0]} color={'#ffb35c'} intensity={4.5} distance={9} decay={2} />
    </group>
  )
}

/* ---------------- Full study ---------------- */

export function AncientStudy({ progress }: { progress: MutableRefObject<{ value: number }> }) {
  const [cx, cy, cz] = STUDY_CENTER
  return (
    <group position={[cx, cy, cz]}>
      <RoomShell />
      <WindowShaft />
      <Fireplace />

      <Bookshelf position={[-4, 0, -10.6]} seed={11} />
      <Bookshelf position={[-8, 0, -10.6]} seed={23} />
      <Bookshelf position={[0.2, 0, -10.6]} seed={37} />
      <Bookshelf position={[10.6, 0, -4]} rotation={-Math.PI / 2} seed={51} />

      <Globe position={[-8.6, 0, 6.4]} />
      <Telescope position={[-9, 0, -6.8]} rotation={0.7} />
      <ArmorStand position={[9.2, 0, 6.8]} rotation={-0.7} />
      <ArmorStand position={[-9.4, 0, 9.2]} rotation={0.9} />
      <WallArms position={[5.5, 5, 10.6]} />
      <TreasureChest position={[8.6, 0, 1.6]} rotation={-0.5} />
      <SideDesk position={[-7.8, 0, 1.8]} rotation={1.5} />
      <ParchmentBarrel position={[3.9, 0, 9.6]} />

      {/* Worn rug beneath the exploration table */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0.06]}>
        <planeGeometry args={[7, 5.4]} />
        <meshStandardMaterial color={'#5c3a30'} roughness={1} />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0.06]}>
        <ringGeometry args={[2.2, 2.4, 24]} />
        <meshStandardMaterial color={'#8a6a4a'} roughness={1} />
      </mesh>

      <MapTable progress={progress} />

      {/* Standing candles around the room */}
      <Candle position={[-6.2, 1.06, 1.9]} phase={2.2} height={0.4} />
      <Candle position={[4.2, 0.9, 9.5]} phase={5.3} height={0.5} />
      <pointLight position={[-6, 2, 2]} color={'#ffb35c'} intensity={2.4} distance={7} decay={2} />

      {/* Dust motes drifting in the candlelight */}
      <Sparkles count={110} scale={[16, 7, 16]} size={1.6} speed={0.14} color={'#ffdda0'} position={[0, 4, 0]} opacity={0.55} />
      <Sparkles count={40} scale={[4, 3, 3.5]} size={2.2} speed={0.1} color={'#ffe6b8'} position={[0, 3.2, 0]} opacity={0.7} />
    </group>
  )
}
