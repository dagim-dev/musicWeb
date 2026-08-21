import clsx from 'clsx'
import { useCallback, useState, useSyncExternalStore } from 'react'

const GLYPH_POOL = ['♪', '♫', '♬', '♩', '𝄞', '𝄢', '♭', '♯', '🎵', '🎶'] as const
const GLYPH_COUNT = 30
const PEAK_OPACITY = 0.32

type GlyphColor = 'accent' | 'secondary'

interface FallingGlyph {
  id: number
  glyph: string
  left: number
  size: number
  duration: number
  delay: number
  color: GlyphColor
  cycle: number
}

function pickGlyph(exclude?: string): string {
  const pool = exclude
    ? GLYPH_POOL.filter((glyph) => glyph !== exclude)
    : GLYPH_POOL
  return pool[Math.floor(Math.random() * pool.length)] ?? GLYPH_POOL[0]
}

function randomLeft(): number {
  return 2 + Math.random() * 96
}

function randomSize(): number {
  return 16 + Math.random() * 22
}

function randomDuration(): number {
  return 10 + Math.random() * 14
}

function randomColor(): GlyphColor {
  return Math.random() > 0.5 ? 'accent' : 'secondary'
}

function createGlyph(id: number): FallingGlyph {
  const duration = randomDuration()
  return {
    id,
    glyph: pickGlyph(),
    left: randomLeft(),
    size: randomSize(),
    duration,
    delay: -Math.random() * duration,
    color: randomColor(),
    cycle: 0,
  }
}

function respawnGlyph(current: FallingGlyph): FallingGlyph {
  return {
    ...current,
    glyph: pickGlyph(current.glyph),
    left: randomLeft(),
    size: randomSize(),
    duration: randomDuration(),
    delay: 0,
    color: randomColor(),
    cycle: current.cycle + 1,
  }
}

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServerSnapshot() {
  return false
}

export function BackgroundNotes() {
  const [glyphs, setGlyphs] = useState(() =>
    Array.from({ length: GLYPH_COUNT }, (_, id) => createGlyph(id)),
  )
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  )

  const handleAnimationEnd = useCallback((id: number) => {
    setGlyphs((prev) => prev.map((glyph) => (glyph.id === id ? respawnGlyph(glyph) : glyph)))
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {glyphs.map((glyph) => (
        <span
          key={`${glyph.id}-${glyph.cycle}`}
          className={clsx(
            'absolute top-0 select-none leading-none',
            prefersReducedMotion ? 'animate-none' : 'animate-fall-glyph',
            glyph.color === 'accent' ? 'text-accent' : 'text-accent-secondary',
          )}
          style={{
            left: `${glyph.left}%`,
            fontSize: `${glyph.size}px`,
            ['--fall-duration' as string]: `${glyph.duration}s`,
            ['--fall-delay' as string]: `${glyph.delay}s`,
            ['--glyph-peak-opacity' as string]: String(PEAK_OPACITY),
            ...(prefersReducedMotion
              ? { top: `${(glyph.id * 37) % 85 + 5}%`, opacity: PEAK_OPACITY * 0.65 }
              : undefined),
          }}
          onAnimationEnd={
            prefersReducedMotion ? undefined : () => handleAnimationEnd(glyph.id)
          }
        >
          {glyph.glyph}
        </span>
      ))}
    </div>
  )
}
