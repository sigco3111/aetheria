'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Endless crystal-blue ocean with gentle waves, sparkle and a sun path. */
export function Ocean() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDeep: { value: new THREE.Color('#1b5f8f') },
          uShallow: { value: new THREE.Color('#3fb8c9') },
          uSun: { value: new THREE.Color('#ffd9a0') },
          uFogColor: { value: new THREE.Color('#f2e8d5') },
          uFogDensity: { value: 0.058 },
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vWorld;
          varying float vDepth;
          void main() {
            vec3 p = position;
            vec4 world = modelMatrix * vec4(p, 1.0);
            world.y += sin(world.x * 0.08 + uTime * 0.9) * 0.35
                     + cos(world.z * 0.06 + uTime * 0.7) * 0.3;
            vWorld = world.xyz;
            vec4 mv = viewMatrix * world;
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uSun;
          uniform vec3 uFogColor;
          uniform float uFogDensity;
          varying vec3 vWorld;
          varying float vDepth;
          void main() {
            float d = length(vWorld.xz);
            // Turquoise shallows near the island, deep blue beyond
            float shore = smoothstep(120.0, 34.0, d);
            vec3 col = mix(uDeep, uShallow, shore);
            // Gentle irregular sparkle
            float sp = sin(vWorld.x * 0.53 + uTime * 1.3 + sin(vWorld.z * 0.21))
                     * sin(vWorld.z * 0.47 - uTime * 1.1 + sin(vWorld.x * 0.17));
            sp = pow(max(sp, 0.0), 18.0);
            col += vec3(1.0, 0.97, 0.9) * sp * 0.16;
            // Warm sun path stretching toward the horizon (sun sits behind the island, -z)
            float path = exp(-abs(vWorld.x) * 0.012) * smoothstep(0.0, -400.0, vWorld.z);
            col = mix(col, uSun, clamp(path * 0.5, 0.0, 0.5));
            // Soft foam ring at the shore
            float foam = smoothstep(36.5, 35.0, d) * smoothstep(33.0, 34.5, d);
            col = mix(col, vec3(0.96, 0.99, 1.0), foam * 0.8);
            // Match the scene's exponential-squared fog
            float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
            col = mix(col, uFogColor, clamp(fogFactor, 0.0, 1.0));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    []
  )

  useFrame(({ clock, scene }) => {
    material.uniforms.uTime.value = clock.getElapsedTime()
    const fog = scene.fog as THREE.FogExp2 | null
    if (fog) material.uniforms.uFogDensity.value = fog.density
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} material={material}>
      <planeGeometry args={[4000, 4000, 96, 96]} />
    </mesh>
  )
}

function Boat({
  position,
  rotation = 0,
  sail = '#f0e6d2',
  phase = 0,
}: {
  position: [number, number, number]
  rotation?: number
  sail?: string
  phase?: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() + phase
    ref.current.position.y = position[1] + Math.sin(t * 0.9) * 0.25
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.05
    ref.current.rotation.x = Math.cos(t * 0.55) * 0.04
  })
  return (
    <group ref={ref} position={position} rotation={[0, rotation, 0]}>
      {/* Hull */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[3.4, 0.7, 1.3]} />
        <meshStandardMaterial color={'#7a5236'} roughness={1} />
      </mesh>
      <mesh position={[1.9, 0.45, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.9, 0.5, 1.1]} />
        <meshStandardMaterial color={'#6b4a2f'} roughness={1} />
      </mesh>
      {/* Mast + sail */}
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 2.6, 6]} />
        <meshStandardMaterial color={'#5c3f28'} />
      </mesh>
      <mesh position={[-0.65, 1.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 1.7]} />
        <meshStandardMaterial color={sail} side={THREE.DoubleSide} roughness={1} />
      </mesh>
    </group>
  )
}

export function Boats() {
  return (
    <group>
      <Boat position={[14, -0.15, 44]} rotation={0.7} phase={0} />
      <Boat position={[-26, -0.15, 40]} rotation={-0.4} sail={'#c9483a'} phase={2.4} />
      <Boat position={[40, -0.15, -18]} rotation={1.8} phase={4.1} />
    </group>
  )
}
