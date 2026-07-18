'use client'

import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { doorOpenAt, ELDER_HOUSE_POS, lanternGlowAt, ravenAt } from '@/lib/cinematic'

const WOOD_DARK = '#6b4a2f'
const PLASTER = '#e9dcc4'
const STONE = '#a8a29a'

interface ElderHouseProps {
  /** Smoothed scroll progress 0..1, shared with the director. */
  progress: MutableRefObject<{ value: number }>
}

/**
 * The old house at the end of the street. As the journey nears it,
 * a raven lands on the roof, the lantern wakes, warm light spills from
 * the windows and the door creaks open on its hinge — no jump cuts.
 */
export function ElderHouse({ progress }: ElderHouseProps) {
  const door = useRef<THREE.Group>(null)
  const lanternMat = useRef<THREE.MeshStandardMaterial>(null)
  const lanternLight = useRef<THREE.PointLight>(null)
  const innerGlow = useRef<THREE.MeshStandardMaterial>(null)
  const raven = useRef<THREE.Group>(null)
  const ravenHead = useRef<THREE.Group>(null)
  const wings = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const p = progress.current.value

    // Door swings open on its hinge with a slow, creaking ease
    const open = doorOpenAt(p)
    if (door.current) door.current.rotation.y = -open * 1.9

    // Lantern flickers awake
    const glow = lanternGlowAt(p)
    const flicker = 0.75 + Math.sin(t * 11) * 0.12 + Math.sin(t * 27 + 1.3) * 0.08
    if (lanternMat.current) lanternMat.current.emissiveIntensity = 0.15 + glow * flicker * 2.6
    if (lanternLight.current) lanternLight.current.intensity = glow * flicker * 5
    if (innerGlow.current) innerGlow.current.emissiveIntensity = 0.3 + glow * 1.6 + open * 1.2

    // Raven: swoops in along an arc, then perches with idle head tilts
    const r = ravenAt(p)
    if (raven.current) {
      raven.current.visible = r > 0.001
      const perchY = 3.35
      if (r < 1) {
        // approach arc from high behind-left
        raven.current.position.set(
          -4 + r * 4,
          perchY + (1 - r) * 5.5,
          3.5 - r * 3.2
        )
        raven.current.rotation.y = 0.8 - r * 0.8
        const flap = Math.sin(t * 16) * (1 - r) * 1.1
        wings.current.forEach((w, i) => {
          if (w) w.rotation.z = (i === 0 ? 1 : -1) * (0.15 + flap)
        })
      } else {
        raven.current.position.set(0, perchY, 0.3)
        raven.current.rotation.y = 0
        wings.current.forEach((w, i) => {
          if (w) w.rotation.z = (i === 0 ? 1 : -1) * 0.12
        })
        // idle: occasional head tilt + a single "caw" bob
        if (ravenHead.current) {
          const caw = Math.max(0, Math.sin(t * 0.5)) ** 14
          ravenHead.current.rotation.z = Math.sin(t * 0.7) * 0.22
          ravenHead.current.rotation.x = -caw * 0.5
        }
      }
    }
  })

  return (
    <group position={ELDER_HOUSE_POS} scale={1.6}>
      {/* Body */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.5, 1.7, 2]} />
        <meshStandardMaterial color={PLASTER} roughness={1} />
      </mesh>
      {/* Timber frame base + beams */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[2.6, 0.4, 2.1]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      {[-1.05, 1.05].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 1.01]}>
          <boxGeometry args={[0.12, 1.7, 0.05]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 1.62, 1.01]}>
        <boxGeometry args={[2.3, 0.12, 0.05]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.15, 1.5, 4]} />
        <meshStandardMaterial color={'#7a5138'} flatShading roughness={1} />
      </mesh>
      {/* Chimney */}
      <mesh position={[-0.7, 2.55, -0.35]}>
        <boxGeometry args={[0.34, 1, 0.34]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>

      {/* Doorway: dark opening + swinging door on a hinge */}
      <mesh position={[0, 0.62, 0.99]}>
        <planeGeometry args={[0.56, 1.14]} />
        <meshStandardMaterial color={'#120b06'} />
      </mesh>
      <group ref={door} position={[-0.28, 0.62, 1.02]}>
        <mesh position={[0.28, 0, 0]} castShadow>
          <boxGeometry args={[0.56, 1.14, 0.05]} />
          <meshStandardMaterial color={'#5d4028'} roughness={1} />
        </mesh>
        <mesh position={[0.46, 0, 0.04]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color={'#c9a24b'} metalness={0.7} roughness={0.4} />
        </mesh>
      </group>
      {/* Warm light spilling from inside the doorway */}
      <mesh position={[0, 0.62, 0.97]}>
        <planeGeometry args={[0.5, 1.08]} />
        <meshStandardMaterial
          ref={innerGlow}
          color={'#ffd98a'}
          emissive={'#ff9d3c'}
          emissiveIntensity={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Windows, softly lit */}
      {[-0.78, 0.78].map((x, i) => (
        <mesh key={i} position={[x, 1.05, 1.01]}>
          <planeGeometry args={[0.38, 0.42]} />
          <meshStandardMaterial color={'#ffd98a'} emissive={'#ffb84d'} emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Hanging lantern beside the door */}
      <group position={[0.62, 1.32, 1.12]}>
        <mesh position={[0, 0.14, -0.06]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 5]} />
          <meshStandardMaterial color={'#3a3a3a'} metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.14, 0.2, 0.14]} />
          <meshStandardMaterial
            ref={lanternMat}
            color={'#ffd98a'}
            emissive={'#ff9d3c'}
            emissiveIntensity={0.15}
            transparent
            opacity={0.95}
          />
        </mesh>
        <pointLight ref={lanternLight} color={'#ffab52'} intensity={0} distance={7} decay={2} />
      </group>

      {/* Raven */}
      <group ref={raven} visible={false} scale={0.8}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 8, 7]} />
          <meshStandardMaterial color={'#16161c'} roughness={0.85} />
        </mesh>
        <group ref={ravenHead} position={[0, 0.1, 0.1]}>
          <mesh>
            <sphereGeometry args={[0.075, 7, 6]} />
            <meshStandardMaterial color={'#16161c'} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.01, 0.09]} rotation={[1.35, 0, 0]}>
            <coneGeometry args={[0.025, 0.09, 5]} />
            <meshStandardMaterial color={'#2e2e36'} roughness={0.7} />
          </mesh>
        </group>
        <mesh
          ref={(el) => {
            wings.current[0] = el
          }}
          position={[-0.11, 0.03, -0.02]}
          rotation={[0, 0, 0.15]}
        >
          <boxGeometry args={[0.2, 0.03, 0.14]} />
          <meshStandardMaterial color={'#101016'} roughness={0.9} />
        </mesh>
        <mesh
          ref={(el) => {
            wings.current[1] = el
          }}
          position={[0.11, 0.03, -0.02]}
          rotation={[0, 0, -0.15]}
        >
          <boxGeometry args={[0.2, 0.03, 0.14]} />
          <meshStandardMaterial color={'#101016'} roughness={0.9} />
        </mesh>
        {/* tail */}
        <mesh position={[0, 0.02, -0.15]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.07, 0.02, 0.16]} />
          <meshStandardMaterial color={'#101016'} roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
