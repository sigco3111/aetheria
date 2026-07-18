'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cloud, Clouds, Sky, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { cameraPoseAt, fogDensityAt, INTRO_END, lightRampAt } from '@/lib/cinematic'
import { Island } from './island'
import { Birds, CloudShadows, FloatingLeaves, Forest, Grass } from './nature'
import { Boats, Ocean } from './ocean'

interface SceneProps {
  skipRequested: boolean
  onRevealed: () => void
}

/** Drives the cinematic timeline: camera, fog density and light ramp. */
function CinematicDirector({ skipRequested, onRevealed }: SceneProps) {
  const { camera, scene } = useThree()
  const startRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const revealedRef = useRef(false)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const target = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    if (startRef.current === null) startRef.current = clock.getElapsedTime()
    let t = clock.getElapsedTime() - startRef.current + offsetRef.current

    if (skipRequested && t < INTRO_END) {
      offsetRef.current += INTRO_END - t
      t = INTRO_END
    }

    // Camera
    const pose = cameraPoseAt(t)
    camera.position.set(pose.px, pose.py, pose.pz)
    target.set(pose.tx, pose.ty, pose.tz)
    camera.lookAt(target)

    // Fog
    const fog = scene.fog as THREE.FogExp2 | null
    if (fog) fog.density = fogDensityAt(t)

    // Golden light piercing through
    const ramp = lightRampAt(t)
    if (sunRef.current) sunRef.current.intensity = 0.4 + ramp * 2.6

    if (!revealedRef.current && t >= INTRO_END) {
      revealedRef.current = true
      onRevealed()
    }
  })

  return (
    <>
      {/* Warm morning sun rising behind the island */}
      <directionalLight
        ref={sunRef}
        position={[-30, 42, -110]}
        color={'#ffd9a0'}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={250}
      />
    </>
  )
}

/** Faked volumetric god rays: additive light shafts angled from the sun. */
function GodRays() {
  const group = useRef<THREE.Group>(null)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uOpacity: { value: 0.16 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float edge = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
            float fade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.4, vUv.y);
            gl_FragColor = vec4(1.0, 0.88, 0.65, edge * fade * uOpacity);
          }
        `,
      }),
    []
  )
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.children.forEach((shaft, i) => {
      const m = (shaft as THREE.Mesh).material as THREE.ShaderMaterial
      m.uniforms.uOpacity.value = 0.1 + Math.sin(t * 0.35 + i * 1.7) * 0.05 + 0.06
    })
  })
  const shafts = [
    { x: -26, z: -34, w: 10 },
    { x: -6, z: -42, w: 14 },
    { x: 14, z: -36, w: 9 },
    { x: 30, z: -28, w: 12 },
  ]
  return (
    <group ref={group}>
      {shafts.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, 26, s.z]}
          rotation={[0.42, 0, 0.12 * (i - 1.5)]}
          material={material.clone()}
        >
          <planeGeometry args={[s.w, 62]} />
        </mesh>
      ))}
    </group>
  )
}

export function CinematicScene({ skipRequested, onRevealed }: SceneProps) {
  return (
    <>
      {/* Warm haze fog — the star of the opening shot */}
      <fogExp2 attach="fog" args={['#f2e8d5', 0.058]} />
      <color attach="background" args={['#f2e8d5']} />

      {/* Sunrise sky */}
      <Sky
        distance={450000}
        sunPosition={[-30, 14, -110]}
        turbidity={7}
        rayleigh={2.4}
        mieCoefficient={0.02}
        mieDirectionalG={0.92}
      />

      <ambientLight intensity={0.65} color={'#ffeedd'} />
      <hemisphereLight args={['#bfe3ff', '#7a9b6a', 0.55]} />

      <CinematicDirector skipRequested={skipRequested} onRevealed={onRevealed} />

      <Island />
      <Forest />
      <Grass />
      <Birds />
      <FloatingLeaves />
      <CloudShadows />
      <Ocean />
      <Boats />
      <GodRays />

      {/* Soft drifting clouds */}
      <Clouds material={THREE.MeshBasicMaterial} limit={200}>
        <Cloud seed={1} segments={16} bounds={[60, 6, 40]} volume={26} color={'#fff5e6'} position={[0, 38, -30]} opacity={0.5} speed={0.12} />
        <Cloud seed={4} segments={12} bounds={[50, 5, 30]} volume={20} color={'#ffffff'} position={[-55, 30, 20]} opacity={0.42} speed={0.1} />
        <Cloud seed={7} segments={12} bounds={[46, 5, 30]} volume={18} color={'#fff0dc'} position={[55, 34, 8]} opacity={0.42} speed={0.14} />
        {/* Low mist hugging the sea around the island */}
        <Cloud seed={11} segments={18} bounds={[80, 4, 80]} volume={30} color={'#f6efe2'} position={[0, 2, 0]} opacity={0.22} speed={0.08} />
      </Clouds>

      {/* Atmospheric motes catching the light */}
      <Sparkles count={130} scale={[90, 34, 90]} size={2.6} speed={0.3} color={'#ffe9c4'} position={[0, 14, 0]} opacity={0.7} />

      {/* Cinematic grade: HDR bloom + vignette */}
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.72} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.62} />
      </EffectComposer>
    </>
  )
}
