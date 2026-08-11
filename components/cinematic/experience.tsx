'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AmbientAudio } from './ambient-audio'
import { CinematicScene, type JourneyUiRefs } from './scene'

const NAV_LINKS = [
  { label: '섬', href: '/cartographers_sanctum/index.html' },
  { label: '전설', href: '/achievements/index.html' },
  { label: '금고', href: '/curators_vault/index.html' },
  { label: '갤러리', href: '#' },
] as const

/** Total scrollable length of the journey. Longer = slower, more cinematic. */
const SCROLL_LENGTH_VH = 900

export function CinematicExperience() {
  const [revealed, setRevealed] = useState(false)
  const [skipRequested, setSkipRequested] = useState(false)
  const [showSkip, setShowSkip] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const audioRef = useRef<AmbientAudio | null>(null)

  // Shared with the R3F director: { raw } written here, { value } smoothed there.
  const progress = useRef({ raw: 0, value: 0 })
  const revealedRef = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)

  // DOM overlays driven directly from the render loop (no react state churn)
  const fadeRef = useRef<HTMLDivElement>(null)
  const scene2Ref = useRef<HTMLDivElement>(null)
  const scene3Ref = useRef<HTMLDivElement>(null)
  const ui = useRef<JourneyUiRefs>({ fade: fadeRef, scene2: scene2Ref, scene3: scene3Ref })

  // Title card + scroll hint fade out as the journey begins
  const titleRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 2500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    return () => audioRef.current?.stop()
  }, [])

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

  const onRevealed = useCallback(() => {
    revealedRef.current = true
    setRevealed(true)
  }, [])

  const onScroll = useCallback(() => {
    const el = scroller.current
    if (!el) return
    // Scroll only drives the journey once the intro reveal has finished.
    if (!revealedRef.current) {
      el.scrollTop = 0
      return
    }
    const max = el.scrollHeight - el.clientHeight
    const p = max > 0 ? el.scrollTop / max : 0
    progress.current.raw = p
    // Title + hint dissolve as the descent begins (styles only — no rerender)
    const fade = String(Math.max(0, 1 - p / 0.04))
    if (titleRef.current) titleRef.current.style.opacity = fade
    if (hintRef.current) hintRef.current.style.opacity = fade
  }, [])

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
          ui={ui.current}
        />
      </Canvas>

      <h1 className="sr-only">에테리아 섬 — 아침 안개 속으로 드러나는 중세 판타지 부유 섬</h1>

      {/* ---- Invisible scroll track: native wheel/trackpad/touch momentum ---- */}
      <div
        ref={scroller}
        onScroll={onScroll}
        className={`absolute inset-0 z-10 overflow-y-auto overscroll-none ${
          revealed ? '' : 'pointer-events-none'
        }`}
        style={{ scrollbarWidth: 'none' }}
        aria-label="스크롤하여 섬을 여행하세요"
      >
        <div style={{ height: `${SCROLL_LENGTH_VH}vh` }} aria-hidden="true" />
      </div>

      {/* ---- Navigation: hidden until the island reveal completes ---- */}
      <header
        className={`pointer-events-none absolute inset-x-0 top-0 z-40 transition-all duration-[2000ms] ease-out ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
        aria-hidden={!revealed}
      >
        <nav
          className={`mx-auto mt-4 flex max-w-5xl items-center justify-between gap-4 rounded-full border border-parchment/15 bg-abyss/55 px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md md:mt-6 md:gap-6 md:px-7 md:py-3 ${
            revealed ? 'pointer-events-auto' : ''
          }`}
          aria-label="Main"
        >
          <a href="#" className="font-serif text-lg font-semibold tracking-[0.22em] text-parchment md:text-xl">
            에테리아
          </a>
          <ul className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-serif text-sm tracking-[0.18em] text-parchment transition-colors hover:text-gold"
                >
                  {link.label.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="/grand_guild_exchange/index.html"
            className="rounded-full border border-gold/70 bg-gold/85 px-5 py-2 font-serif text-xs tracking-[0.2em] text-abyss transition-colors hover:bg-gold hover:text-abyss md:text-sm"
          >
            여행 시작
          </a>
        </nav>
      </header>

      {/* ---- Title card, revealed with the nav, dissolves on first scroll ---- */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-14 z-10 transition-all delay-500 duration-[2500ms] ease-out md:bottom-20 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        aria-hidden={!revealed}
      >
        <div ref={titleRef} className="flex flex-col items-center gap-3 px-6 text-center">
          <p className="font-serif text-[10px] tracking-[0.5em] text-gold drop-shadow-[0_2px_8px_rgba(20,30,50,0.7)] md:text-xs">
            끝없는 바다 너머
          </p>
          <p className="text-balance font-serif text-3xl font-semibold tracking-[0.14em] text-parchment drop-shadow-[0_4px_18px_rgba(20,30,50,0.65)] md:text-5xl">
            에테리아 섬
          </p>
          <p className="max-w-md text-pretty font-serif text-xs leading-relaxed tracking-wider text-parchment/85 drop-shadow-[0_2px_10px_rgba(20,30,50,0.7)] md:text-sm">
            {'아침 안개가 걷히면, 고대 왕국이 당신을 기다립니다.'}
          </p>
          {/* Scroll hint */}
          <div ref={hintRef} className="mt-4 flex flex-col items-center gap-1.5">
            <p className="font-serif text-[10px] tracking-[0.4em] text-parchment/75 drop-shadow-[0_2px_8px_rgba(20,30,50,0.7)]">
              스크롤하여 내려가기
            </p>
            <span className="block h-7 w-px animate-pulse bg-parchment/60" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* ---- Scene 2 caption: the living village ---- */}
      <div
        ref={scene2Ref}
        className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-2 px-6 text-center opacity-0 md:bottom-24"
        aria-hidden="true"
      >
        <p className="font-serif text-[10px] tracking-[0.5em] text-gold drop-shadow-[0_2px_8px_rgba(20,30,50,0.7)] md:text-xs">
          장면 II
        </p>
        <p className="text-balance font-serif text-2xl font-semibold tracking-[0.14em] text-parchment drop-shadow-[0_4px_18px_rgba(20,30,50,0.65)] md:text-4xl">
          살아있는 마을
        </p>
      </div>

      {/* ---- Scene 3 caption: the ancient study ---- */}
      <div
        ref={scene3Ref}
        className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-2 px-6 text-center opacity-0 md:bottom-24"
        aria-hidden="true"
      >
        <p className="font-serif text-[10px] tracking-[0.5em] text-gold drop-shadow-[0_2px_8px_rgba(255,171,82,0.4)] md:text-xs">
          장면 III
        </p>
        <p className="text-balance font-serif text-2xl font-semibold tracking-[0.14em] text-[#e8d5b0] drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)] md:text-4xl">
          고대의 서재
        </p>
      </div>

      {/* ---- Door-threshold darkness: driven by the render loop ---- */}
      <div
        ref={fadeRef}
        className="pointer-events-none absolute inset-0 z-[25] bg-black opacity-0"
        aria-hidden="true"
      />

      {/* ---- Skip intro ---- */}
      {showSkip && !revealed && (
        <button
          type="button"
          onClick={() => setSkipRequested(true)}
          className="absolute bottom-6 right-6 z-30 rounded-full border border-parchment/40 bg-abyss/30 px-4 py-2 font-serif text-xs tracking-[0.2em] text-parchment/90 backdrop-blur-sm transition-colors hover:border-parchment hover:text-parchment"
        >
          인트로 건너뛰기
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
        {soundOn ? '사운드 켜짐' : '사운드 켜기'}
      </button>
    </main>
  )
}
