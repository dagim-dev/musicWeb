import clsx from 'clsx'
import type { JobStage } from '@/api/client'

interface MusicProgressProps {
  value: number
  stage?: JobStage
  showPercent?: boolean
  className?: string
}

const BAR_COUNT = 12
const ACTIVE_STAGES: JobStage[] = ['downloading', 'converting', 'tagging', 'delivering']

export function MusicProgress({ value, stage, showPercent = true, className }: MusicProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const filledBars = Math.round((clamped / 100) * BAR_COUNT)
  const isQueued = stage === 'queued'
  const isDone = stage === 'done'
  const isActive = stage ? ACTIVE_STAGES.includes(stage) : clamped < 100
  const isFrozen = stage === 'error' || stage === 'cancelled'

  return (
    <div className={clsx('space-y-2', className)}>
      <div
        className={clsx(
          'relative flex h-8 items-end justify-between gap-1 overflow-hidden rounded-sm',
          isDone && 'glow-accent',
        )}
        role="progressbar"
        aria-valuenow={isDone ? 100 : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: BAR_COUNT }).map((_, index) => {
          const isFilled = isDone || index < filledBars
          const height = isDone ? 100 : 30 + ((index * 7) % 50)

          return (
            <div
              key={index}
              className={clsx(
                'flex-1 origin-bottom rounded-sm transition-all duration-300',
                isQueued
                  ? 'bg-accent/55 opacity-90 shadow-[0_0_6px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]'
                  : isFilled
                    ? isFrozen
                      ? 'bg-danger/60 opacity-80'
                      : 'gradient-accent opacity-100'
                    : 'bg-surface-muted opacity-40',
                isQueued && 'animate-[equalizer-idle_1.6s_ease-in-out_infinite]',
                isActive && isFilled && 'animate-[equalizer-bounce_0.8s_ease-in-out_infinite]',
                isDone && 'animate-[equalizer-complete_0.6s_ease-out_both]',
              )}
              style={{
                height: `${height}%`,
                animationDelay: isQueued
                  ? `${index * 0.12}s`
                  : isActive && isFilled
                    ? `${index * 0.07}s`
                    : isDone
                      ? `${index * 0.04}s`
                      : undefined,
              }}
            />
          )
        })}
        {isActive ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-shimmer opacity-60 mix-blend-screen"
          />
        ) : null}
      </div>
      {showPercent ? (
        <p
          className={clsx(
            'text-right text-xs font-semibold tabular-nums',
            isDone ? 'text-success' : isFrozen ? 'text-danger' : 'text-accent',
          )}
        >
          {isDone ? 'Complete' : `${Math.round(clamped)}%`}
        </p>
      ) : null}
    </div>
  )
}
