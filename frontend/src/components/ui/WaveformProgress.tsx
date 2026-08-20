import clsx from 'clsx'
import { useMemo } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface WaveformProgressProps {
  value: number
  active?: boolean
  className?: string
}

const BAR_COUNT = 32
const HEIGHTS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const wave = Math.abs(Math.sin(index * 0.72)) * 0.7 + 0.3
  return Math.round(wave * 100)
})

export function WaveformProgress({ value, active = false, className }: WaveformProgressProps) {
  const reduced = usePrefersReducedMotion()
  const clamped = Math.min(100, Math.max(0, value))
  const animate = active && !reduced

  const bars = useMemo(() => HEIGHTS, [])

  return (
    <div
      className={clsx('flex h-10 w-full min-w-0 items-end gap-px', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      style={{
        WebkitMaskImage: `linear-gradient(90deg, #000 ${clamped}%, rgb(0 0 0 / 0.22) ${clamped}%)`,
        maskImage: `linear-gradient(90deg, #000 ${clamped}%, rgb(0 0 0 / 0.22) ${clamped}%)`,
      }}
    >
      {bars.map((height, index) => (
        <span
          key={index}
          className={clsx('waveform-bar min-w-0 flex-1 rounded-full bg-accent', animate && 'is-active')}
          style={{
            height: `${height}%`,
            animationDelay: `${index * 38}ms`,
          }}
        />
      ))}
    </div>
  )
}
