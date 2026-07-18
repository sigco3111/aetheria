'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AmbientAudio } from './ambient-audio'
import { CinematicScene, type JourneyUiRefs } from './scene'

const NAV_LINKS = ['The Isle', 'Legends', 'The Keep', 'Gallery'] as const

export function CinematicExperience() {
  const [revealed, setRevealed] = useState(false)
  const [skipRequested, setSkipRequested] = useState(false)
  const [showSkip, setShowSkip] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const audioRef = useRef<AmbientAudio | null>(null)

  // Scroll progress shared between the DOM scroll handler and the R3F render loop.
  // { raw } is written on every wheel/touch event, { value } is the smoothed version
  // driven inside CinematicDirector's useFrame.
  const progress = useRef({ raw: 0, value: 0 })

  // DOM overlay refs driven imperatively from the render loop (no React state churn).
  const fadeRef = useRef<HTMLDivElement>(null)
  const scene2Ref = useRef<HTMLDivElement>(null)
  const scene3Ref = useRef<HTMLDivElement>(null)
  const ui: JourneyUiRefs = {
    fade: fadeRef,
    scene2: scene2Ref,
    scene3: scene3Ref,
  }

  // --- Skip-intro button delay ---
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 2500)
    return () => clearTimeout(t)
  }, [])

  // --- Cleanup audio on unmount ---
  useEffect(() => {
    return () => audioRef.current?.stop()
  }, [])

  // --- Scroll-driven progress ---
  // We normalize wheel / trackpad delta into a 0..1 range.
  // The total scrollable "distance" is ~6000px worth of delta.
  useEffect(() => {
    if (!revealed) return

    const TOTAL = 6000 // total virtual scroll distance in px
    let accumulated = 0

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Normalize wheel delta: trackpad gives small px values, mouse wheel gives larger
      const delta = Math.abs(e.deltaY) > 60 ? e.deltaY * 0.3 : e.deltaY
      accumulated = Math.max(0, Math.min(TOTAL, accumulated + delta))
      progress.current.raw = accumulated / TOTAL
    }

    // Touch support for mobile
    let lastTouchY = 0
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const delta = lastTouchY - e.touches[0].clientY
      lastTouchY = e.touches[0].clientY
      accumulated = Math.max(0, Math.min(TOTAL, accumulated + delta * 1.5))
      progress.current.raw = accumulated / TOTAL
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [revealed])

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      if (!on) {
        if (!audioRef.current) audioRef.current = new AmbientAudio()
        audioRef.current.start()
      } else {
        audioRef.current?.stop()
        audioRef.current = null
      }
      return !on
    })
  }, [])

  const onRevealed = useCallback(() => setRevealed(true), [])

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#f2e8d5]">
      <Canvas
        shadows
        camera={{ position: [0, 34, 195], fov: 48, near: 0.5, far: 3500 }}
        gl={{ antialias: true }}
        dpr={[1, 1.75]}
        aria-hidden="true"
      >
        <CinematicScene
          skipRequested={skipRequested}
          onRevealed={onRevealed}
          progress={progress}
          ui={ui}
        />
      </Canvas>

      <h1 className="sr-only">Aetheria Isle — a floating medieval fantasy island revealed from the morning mist</h1>

      {/* ---- Door-threshold darkness overlay ---- */}
      <div
        ref={fadeRef}
        className="pointer-events-none absolute inset-0 z-10 bg-black"
        style={{ opacity: 0 }}
        aria-hidden="true"
      />

      {/* ---- Scene 2 text overlay: village flythrough ---- */}
      <div
        ref={scene2Ref}
        className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex flex-col items-center gap-2 px-6 text-center"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <p className="font-serif text-[10px] tracking-[0.5em] text-gold drop-shadow-[0_2px_8px_rgba(20,30,50,0.7)] md:text-xs">
          THE LIVING VILLAGE
        </p>
        <p className="font-serif text-lg font-semibold tracking-[0.14em] text-parchment drop-shadow-[0_4px_18px_rgba(20,30,50,0.65)] md:text-2xl">
          Where Voices Echo Through Cobblestone
        </p>
      </div>

      {/* ---- Scene 3 text overlay: elder's study ---- */}
      <div
        ref={scene3Ref}
        className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex flex-col items-center gap-2 px-6 text-center"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <p className="font-serif text-[10px] tracking-[0.5em] text-gold drop-shadow-[0_2px_8px_rgba(20,30,50,0.7)] md:text-xs">
          THE ANCIENT STUDY
        </p>
        <p className="font-serif text-lg font-semibold tracking-[0.14em] text-parchment drop-shadow-[0_4px_18px_rgba(20,30,50,0.65)] md:text-2xl">
          Secrets Inscribed in Fading Ink
        </p>
      </div>

      {/* ---- Navigation: hidden until the island reveal completes ---- */}
      <header
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 transition-all duration-[2000ms] ease-out ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
        aria-hidden={!revealed}
      >
        <nav
          className={`mx-auto flex max-w-5xl items-center justify-between px-6 py-5 md:px-10 ${
            revealed ? 'pointer-events-auto' : ''
          }`}
          aria-label="Main"
        >
          <a href="#" className="font-serif text-lg font-semibold tracking-[0.22em] text-parchment drop-shadow-[0_2px_10px_rgba(20,30,50,0.55)] md:text-xl">
            AETHERIA
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="font-serif text-sm tracking-[0.18em] text-parchment/90 drop-shadow-[0_2px_8px_rgba(20,30,50,0.6)] transition-colors hover:text-gold"
                >
                  {link.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="rounded-full border border-gold/70 bg-abyss/40 px-5 py-2 font-serif text-xs tracking-[0.2em] text-gold backdrop-blur-sm transition-colors hover:bg-gold hover:text-abyss md:text-sm"
          >
            BEGIN JOURNEY
          </a>
        </nav>
      </header>

      {/* ---- Title card, revealed with the nav ---- */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-14 z-10 flex flex-col items-center gap-3 px-6 text-center transition-all delay-500 duration-[2500ms] ease-out md:bottom-20 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        aria-hidden={!revealed}
      >
        <p className="font-serif text-[10px] tracking-[0.5em] text-gold drop-shadow-[0_2px_8px_rgba(20,30,50,0.7)] md:text-xs">
          BEYOND THE ENDLESS SEA
        </p>
        <p className="text-balance font-serif text-3xl font-semibold tracking-[0.14em] text-parchment drop-shadow-[0_4px_18px_rgba(20,30,50,0.65)] md:text-5xl">
          AETHERIA ISLE
        </p>
        <p className="max-w-md text-pretty font-serif text-xs leading-relaxed tracking-wider text-parchment/85 drop-shadow-[0_2px_10px_rgba(20,30,50,0.7)] md:text-sm">
          {'Where the morning mist parts, an ancient kingdom waits.'}
        </p>
      </div>

      {/* ---- Scroll hint — pulses after reveal to invite interaction ---- */}
      {revealed && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center animate-bounce"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-1">
            <p className="font-serif text-[9px] tracking-[0.4em] text-parchment/60 drop-shadow-[0_2px_8px_rgba(20,30,50,0.5)]">
              SCROLL TO EXPLORE
            </p>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-parchment/50">
              <path d="M10 4 L10 16 M5 11 L10 16 L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}

      {/* ---- Skip intro ---- */}
      {showSkip && !revealed && (
        <button
          type="button"
          onClick={() => setSkipRequested(true)}
          className="absolute bottom-6 right-6 z-30 rounded-full border border-parchment/40 bg-abyss/30 px-4 py-2 font-serif text-xs tracking-[0.2em] text-parchment/90 backdrop-blur-sm transition-colors hover:border-parchment hover:text-parchment"
        >
          SKIP INTRO
        </button>
      )}

      {/* ---- Sound toggle (site opens in complete silence) ---- */}
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        className="absolute bottom-6 left-6 z-30 flex items-center gap-2 rounded-full border border-parchment/40 bg-abyss/30 px-4 py-2 font-serif text-xs tracking-[0.2em] text-parchment/90 backdrop-blur-sm transition-colors hover:border-parchment hover:text-parchment"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${soundOn ? 'bg-gold' : 'bg-parchment/40'}`}
          aria-hidden="true"
        />
        {soundOn ? 'SOUND ON' : 'ENABLE SOUND'}
      </button>
    </main>
  )
}
