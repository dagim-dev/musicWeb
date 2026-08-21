import clsx from 'clsx'
import type { JobStage } from '@/api/client'
import { Artwork } from '@/components/ui/Artwork'
import { MusicProgress } from '@/components/ui/MusicProgress'
import type { QueueTrack } from '@/stores/downloadQueueStore'

const stageLabels: Record<JobStage, string> = {
  queued: 'Queued',
  downloading: 'Downloading',
  converting: 'Converting',
  tagging: 'Embedding metadata',
  delivering: 'Delivering',
  done: 'Complete',
  error: 'Failed',
  cancelled: 'Cancelled',
}

interface QueuedTrackRowProps {
  track: QueueTrack
  trackNumber: number
  totalTracks: number
  isActive?: boolean
}

export function QueuedTrackRow({ track, trackNumber, totalTracks, isActive }: QueuedTrackRowProps) {
  const title = track.resolvedTitle ?? track.entry.title
  const artist = track.resolvedArtist ?? track.entry.artist
  const isDone = track.stage === 'done'
  const isError = track.stage === 'error'

  return (
    <div
      className={clsx(
        'flex min-w-0 gap-3 rounded-xl border p-3 transition-all duration-200',
        isActive
          ? 'border-accent/30 bg-accent/5 ring-1 ring-accent/20'
          : isDone
            ? 'border-border/40 bg-surface-muted/30 opacity-80'
            : isError
              ? 'border-danger/30 bg-danger/5'
              : 'border-border/60 bg-surface-muted/20',
      )}
    >
      <Artwork src={track.entry.thumbnail} alt="" size="sm" glow={isActive} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{title}</p>
            {artist ? (
              <p className="truncate text-xs text-text-secondary">{artist}</p>
            ) : null}
          </div>
          <span
            className={clsx(
              'shrink-0 text-xs font-medium',
              isActive ? 'text-accent' : isError ? 'text-danger' : 'text-text-secondary',
            )}
          >
            {stageLabels[track.stage]}
          </span>
        </div>
        <p className="truncate text-xs text-text-secondary">
          Track {trackNumber} of {totalTracks}
          {track.message && track.stage !== 'done' ? ` · ${track.message}` : ''}
        </p>
        {!isDone && !isError && track.stage !== 'cancelled' ? (
          <MusicProgress value={track.percent} stage={track.stage} />
        ) : null}
        {isError && track.error ? (
          <p className="truncate text-xs text-danger">{track.error}</p>
        ) : null}
      </div>
    </div>
  )
}
