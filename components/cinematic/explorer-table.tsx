'use client'

import { useRef, useState, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { tableArtifactFade } from '@/lib/cinematic'

interface ArtifactProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  name: string
  href: string
  children: React.ReactNode
  onHover?: (hovered: boolean, group: THREE.Group, time: number) => void
  onFrame?: (group: THREE.Group, time: number, hovered: boolean) => void
  fade: number
}

function Artifact({ position, rotation = [0, 0, 0], name, href, children, onHover, onFrame, fade }: ArtifactProps) {
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const targetScale = useRef(1)
  const currentScale = useRef(1)

  useCursor(hovered, 'pointer', 'auto')

  useFrame(({ clock }, dt) => {
    if (!group.current) return
    const t = clock.getElapsedTime()

    // Smooth scale animation on hover
    targetScale.current = hovered ? 1.08 : 1
    currentScale.current += (targetScale.current - currentScale.current) * (1 - Math.exp(-dt * 10))
    group.current.scale.setScalar(currentScale.current)

    // Optional per-frame custom animation
    if (onFrame) onFrame(group.current, t, hovered)

    // Apply fade-in during table reveal
    group.current.visible = fade > 0.01
    // A simple hack to fade materials without traversing every frame:
    // We assume the children materials have transparent: true and we just set their opacity if they support it.
    // However, traverse on every frame can be expensive. We'll handle opacity by scaling or just letting them pop in smoothly if possible.
    // Let's use a scale-in combined with the hover scale for the fade effect.
    if (fade < 1) {
       group.current.scale.setScalar(currentScale.current * fade)
    }
  })

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        if (onHover && group.current) onHover(true, group.current, 0)
      }}
      onPointerOut={(e) => {
        setHovered(false)
        if (onHover && group.current) onHover(false, group.current, 0)
      }}
      onClick={(e) => {
        e.stopPropagation()
        // In a real app, use next/navigation router.push
        console.log(`Navigating to ${href}`)
        // Simulate navigation
        alert(`Navigating to ${href}`)
      }}
    >
      {children}
      
      {/* Tooltip */}
      <Html
        position={[0, 0.4, 0]}
        center
        style={{
          opacity: hovered && fade > 0.8 ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
        }}
      >
        <div className="rounded-md border border-gold/40 bg-abyss/80 px-3 py-1.5 font-serif text-xs tracking-wider text-parchment shadow-lg backdrop-blur-md">
          {name}
        </div>
      </Html>
    </group>
  )
}

// ------------------------------------------------------------------
// Specific Artifacts
// ------------------------------------------------------------------

function GoldCoins({ fade }: { fade: number }) {
  const lightRef = useRef<THREE.PointLight>(null)
  
  return (
    <Artifact
      name="ACHIEVEMENTS"
      href="/achievements"
      position={[-1.2, 2.15, 0.8]} // Bottom left
      fade={fade}
      onFrame={(group, t, hovered) => {
         if (lightRef.current) {
            lightRef.current.intensity = hovered ? 1 + Math.sin(t * 10) * 0.2 : 0
         }
      }}
    >
      {/* Stack 1 */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Stack 2 */}
      <mesh position={[0.1, 0, 0.05]} rotation={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Silver coin */}
      <mesh position={[-0.1, 0, 0.1]} rotation={[0.2, 0, 0.1]}>
        <cylinderGeometry args={[0.07, 0.07, 0.015, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
      </mesh>
      <pointLight ref={lightRef} color="#ffd700" distance={0.5} decay={2} intensity={0} />
    </Artifact>
  )
}

function LeatherJournal({ fade }: { fade: number }) {
  return (
    <Artifact
      name="QUESTS"
      href="/quests"
      position={[-1.4, 2.15, -0.6]} // Mid left
      rotation={[0, 0.3, 0]}
      fade={fade}
      onFrame={(group, t, hovered) => {
        // Subtle page flutter when hovered
        if (hovered) {
          const flutter = Math.sin(t * 20) * 0.02
          group.rotation.x = flutter
        } else {
          group.rotation.x = 0
        }
      }}
    >
      {/* Book cover */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.8]} />
        <meshStandardMaterial color="#3a2518" roughness={0.9} />
      </mesh>
      {/* Pages */}
      <mesh position={[0.02, 0.04, 0]}>
        <boxGeometry args={[0.55, 0.06, 0.78]} />
        <meshStandardMaterial color="#f4ebd8" roughness={1} />
      </mesh>
      {/* Bookmark */}
      <mesh position={[0.3, 0.04, 0.2]}>
        <boxGeometry args={[0.1, 0.02, 0.3]} />
        <meshStandardMaterial color="#8b0000" />
      </mesh>
    </Artifact>
  )
}

function Compass({ fade }: { fade: number }) {
  const needleRef = useRef<THREE.Mesh>(null)
  
  return (
    <Artifact
      name="EXPLORE"
      href="/explore"
      position={[-1.0, 2.15, -1.5]} // Top left
      rotation={[0, -0.2, 0]}
      fade={fade}
      onFrame={(group, t, hovered) => {
        if (needleRef.current) {
           needleRef.current.rotation.y = Math.sin(t * 0.5) * 0.5 + (hovered ? t * 2 : 0)
        }
      }}
    >
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
        <meshStandardMaterial color="#b5a642" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.01, 24]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0.03, 0]}>
        <boxGeometry args={[0.02, 0.01, 0.24]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
    </Artifact>
  )
}

function AncientArtifactRelic({ fade }: { fade: number }) {
  const crystalRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  return (
    <Artifact
      name="COMMUNITY"
      href="/community"
      position={[1.2, 2.15, -1.2]} // Top right
      fade={fade}
      onFrame={(group, t, hovered) => {
        if (crystalRef.current) {
          crystalRef.current.position.y = 0.15 + Math.sin(t * 2) * 0.02
          crystalRef.current.rotation.y = t * 0.5
        }
        if (lightRef.current) {
          lightRef.current.intensity = hovered ? 2 + Math.sin(t * 8) * 0.5 : 0.5
        }
      }}
    >
      {/* Base */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.06, 8]} />
        <meshStandardMaterial color="#444" roughness={0.8} />
      </mesh>
      {/* Floating Crystal */}
      <mesh ref={crystalRef} position={[0, 0.15, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color="#44aaff" emissive="#114488" emissiveIntensity={0.5} transparent opacity={0.9} />
      </mesh>
      <pointLight ref={lightRef} color="#44aaff" distance={1} decay={2} intensity={0.5} position={[0, 0.15, 0]} />
    </Artifact>
  )
}

function KnightMedal({ fade }: { fade: number }) {
  return (
    <Artifact
      name="PROFILE"
      href="/profile"
      position={[1.5, 2.15, -0.2]} // Mid right
      rotation={[0, -0.5, 0]}
      fade={fade}
    >
      {/* Ribbon */}
      <mesh position={[0, 0.01, -0.15]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.15, 0.02, 0.3]} />
        <meshStandardMaterial color="#0033aa" roughness={0.7} />
      </mesh>
      {/* Medal Body */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Inner Emblem */}
      <mesh position={[0, 0.036, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.01, 16]} />
        <meshStandardMaterial color="#cc0000" roughness={0.5} />
      </mesh>
    </Artifact>
  )
}

function AncientScroll({ fade }: { fade: number }) {
  return (
    <Artifact
      name="DOCS"
      href="/docs"
      position={[1.0, 2.15, 1.2]} // Bottom right
      rotation={[0, 0.6, 0]}
      fade={fade}
      onFrame={(group, t, hovered) => {
        if (hovered) {
           group.rotation.z = Math.sin(t * 15) * 0.03
        } else {
           group.rotation.z = 0
        }
      }}
    >
      {/* Rolled parchment */}
      <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
        <meshStandardMaterial color="#f4ebd8" roughness={0.9} />
      </mesh>
      {/* Wooden ends */}
      <mesh position={[-0.26, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
        <meshStandardMaterial color="#3a2518" roughness={0.8} />
      </mesh>
      <mesh position={[0.26, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
        <meshStandardMaterial color="#3a2518" roughness={0.8} />
      </mesh>
      {/* Ribbon tie */}
      <mesh position={[0, 0.062, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.062, 0.062, 0.04, 16]} />
        <meshStandardMaterial color="#8b0000" />
      </mesh>
    </Artifact>
  )
}

function TreasureChest({ fade }: { fade: number }) {
  const lidRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  return (
    <Artifact
      name="REWARDS"
      href="/rewards"
      position={[0, 2.15, 1.6]} // Bottom center
      fade={fade}
      onFrame={(group, t, hovered) => {
        if (lidRef.current) {
          // Open slightly on hover
          const targetRot = hovered ? -0.4 : 0
          lidRef.current.rotation.x += (targetRot - lidRef.current.rotation.x) * 0.1
        }
        if (lightRef.current) {
          lightRef.current.intensity = hovered ? 1 + Math.sin(t * 5) * 0.2 : 0
        }
        if (hovered) {
          group.position.x = Math.sin(t * 30) * 0.01 // Slight shake
        } else {
          group.position.x = 0
        }
      }}
    >
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.4, 0.16, 0.25]} />
        <meshStandardMaterial color="#4a3018" roughness={0.9} />
      </mesh>
      {/* Lid */}
      <mesh ref={lidRef} position={[0, 0.16, -0.125]}>
        {/* Offset geometry so it rotates around the hinge (back edge) */}
        <cylinderGeometry args={[0.125, 0.125, 0.4, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#4a3018" roughness={0.9} />
      </mesh>
      <pointLight ref={lightRef} color="#ffd700" distance={1} decay={2} intensity={0} position={[0, 0.16, 0]} />
    </Artifact>
  )
}

export function ExplorerTableArtifacts({ progress }: { progress: MutableRefObject<{ raw: number; value: number }> }) {
  const [fade, setFade] = useState(0)

  // We use useFrame to read the raw progress (which drives the table pullback)
  // and update local state to drive the fade-in of the interactive artifacts.
  useFrame(() => {
    const rawP = progress.current.raw
    const f = tableArtifactFade(rawP)
    if (Math.abs(fade - f) > 0.01) {
      setFade(f)
    }
  })

  // Center is roughly [0, 0, 0] relative to the AncientStudy, 
  // but we are placing these on the table which is at y=2.09.
  // The y-positions in the artifacts are absolute relative to this group.
  
  // NOTE: The table in AncientStudy is at STUDY_CENTER = [0, -60, 0].
  // If we render this inside AncientStudy, local [0,0,0] is the center of the study.
  
  if (fade < 0.01) return null

  return (
    <group>
      <GoldCoins fade={fade} />
      <LeatherJournal fade={fade} />
      <Compass fade={fade} />
      <AncientArtifactRelic fade={fade} />
      <KnightMedal fade={fade} />
      <AncientScroll fade={fade} />
      <TreasureChest fade={fade} />
    </group>
  )
}
