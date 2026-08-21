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
  const isAnimating = stage ? ACTIVE_STAGES.includes(stage) : clamped < 100

  return (
    <div className={clsx('space-y-2', className)}>
      <div className="flex h-8 items-end justify-between gap-1" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: BAR_COUNT }).map((_, index) => {
          const isFilled = index < filledBars
          const height = 30 + ((index * 7) % 50)

          return (
            <div
              key={index}
              className={clsx(
                'flex-1 origin-bottom rounded-sm transition-all duration-300',
                isFilled
                  ? 'gradient-accent opacity-100'
                  : 'bg-surface-muted opacity-40',
                isAnimating && isFilled && 'animate-[equalizer-bounce_0.8s_ease-in-out_infinite]',
              )}
              style={{
                height: `${height}%`,
                animationDelay: isAnimating ? `${index * 0.07}s` : undefined,
              }}
            />
          )
        })}
      </div>
      {showPercent ? (
        <p className="text-right text-xs font-semibold tabular-nums text-accent">
          {Math.round(clamped)}%
        </p>
      ) : null}
    </div>
  )
}
