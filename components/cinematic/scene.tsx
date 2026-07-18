'use client'

import { Suspense, useMemo, useRef, type MutableRefObject, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cloud, Clouds, Sky, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import {
  cameraPoseAt,
  clamp01,
  doorFadeAt,
  fogDensityAt,
  INTRO_END,
  journeyFog,
  journeyPoseAt,
  lerp,
  lightRampAt,
} from '@/lib/cinematic'
import { Island } from './island'
import { Birds, CloudShadows, FloatingLeaves, Forest, Grass } from './nature'
import { Boats, Ocean } from './ocean'
import { Villagers } from './villagers'
import { ElderHouse } from './elder-house'
import { AncientStudy } from './study'

export interface JourneyUiRefs {
  fade: RefObject<HTMLDivElement | null>
  scene2: RefObject<HTMLDivElement | null>
  scene3: RefObject<HTMLDivElement | null>
}

interface SceneProps {
  skipRequested: boolean
  onRevealed: () => void
  /** { raw } is written by the scroll handler; { value } is the smoothed progress. */
  progress: MutableRefObject<{ raw: number; value: number }>
  ui: JourneyUiRefs
}

const FOG_DAY = new THREE.Color('#f2e8d5')
const _fogColor = new THREE.Color()

/** Drives the whole cinematic: intro timeline, then the scroll journey. */
function CinematicDirector({ skipRequested, onRevealed, progress, ui }: SceneProps) {
  const { camera, scene } = useThree()
  const startRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const revealedRef = useRef(false)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const target = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }, dt) => {
    if (startRef.current === null) startRef.current = clock.getElapsedTime()
    let t = clock.getElapsedTime() - startRef.current + offsetRef.current

    if (skipRequested && t < INTRO_END) {
      offsetRef.current += INTRO_END - t
      t = INTRO_END
    }

    // Critically-damped smoothing gives every scroll input cinematic easing.
    const pr = progress.current
    pr.value += (pr.raw - pr.value) * (1 - Math.exp(-dt * 2.4))
    const p = clamp01(pr.value)

    // Camera: intro pose blends seamlessly into the scroll journey.
    const intro = cameraPoseAt(t)
    if (p < 0.001) {
      camera.position.set(intro.px, intro.py, intro.pz)
      target.set(intro.tx, intro.ty, intro.tz)
    } else {
      const j = journeyPoseAt(p)
      const mix = clamp01(p / 0.03) // dissolve out of the idle drift
      // Subtle handheld drift keeps the shot alive without breaking the path
      const drift = Math.max(0, 1 - p * 1.6) * 0.3
      camera.position.set(
        lerp(intro.px, j.px, mix) + Math.sin(t * 0.7) * drift,
        lerp(intro.py, j.py, mix) + Math.sin(t * 0.53) * drift * 0.5,
        lerp(intro.pz, j.pz, mix)
      )
      target.set(lerp(intro.tx, j.tx, mix), lerp(intro.ty, j.ty, mix), lerp(intro.tz, j.tz, mix))
    }
    camera.lookAt(target)

    // Fog: intro schedule, then journey schedule (density + color shift indoors)
    const fog = scene.fog as THREE.FogExp2 | null
    if (fog) {
      if (p < 0.001) {
        fog.density = fogDensityAt(t)
        fog.color.copy(FOG_DAY)
      } else {
        const jf = journeyFog(p)
        fog.density = lerp(fogDensityAt(t), jf.density, clamp01(p / 0.03))
        fog.color.copy(_fogColor.set(jf.color))
      }
    }

    // Golden light piercing through
    const ramp = lightRampAt(t)
    if (sunRef.current) sunRef.current.intensity = (0.4 + ramp * 2.6) * (1 - clamp01((p - 0.6) / 0.15) * 0.85)

    // DOM overlays driven straight from the render loop (no react state churn)
    if (ui.fade.current) ui.fade.current.style.opacity = String(doorFadeAt(p))
    if (ui.scene2.current) {
      const o = clamp01((p - 0.05) / 0.04) * clamp01((0.22 - p) / 0.05)
      ui.scene2.current.style.opacity = String(o)
    }
    if (ui.scene3.current) {
      const o = clamp01((p - 0.76) / 0.04) * clamp01((0.92 - p) / 0.05)
      ui.scene3.current.style.opacity = String(o)
    }

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

export function CinematicScene({ skipRequested, onRevealed, progress, ui }: SceneProps) {
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

      <CinematicDirector skipRequested={skipRequested} onRevealed={onRevealed} progress={progress} ui={ui} />

      <Island />
      <Forest />
      <Grass />
      <Birds />
      <FloatingLeaves />
      <CloudShadows />
      <Ocean />
      <Boats />
      <GodRays />

      {/* Scene 2: the living village layer */}
      <Villagers />

      {/* Scene 3: the elder's house + the study hidden beneath the world */}
      <ElderHouse progress={progress} />
      <Suspense fallback={null}>
        <AncientStudy progress={progress} />
      </Suspense>

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
