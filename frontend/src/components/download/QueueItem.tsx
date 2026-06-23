import type { JobStage } from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import type { QueueJob } from '@/stores/downloadQueueStore'

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

interface QueueItemProps {
  job: QueueJob
  isFirst?: boolean
  isLast?: boolean
  onCancel?: () => void
  onRetryZip?: () => void
  onRetryFailed?: () => void
  onReorder?: (direction: 'up' | 'down') => void
  onDismiss?: () => void
}

export function QueueItem({
  job,
  isFirst,
  isLast,
  onCancel,
  onRetryZip,
  onRetryFailed,
  onReorder,
  onDismiss,
}: QueueItemProps) {
  const completed = job.tracks.filter((track) => track.stage === 'done').length
  const failed = job.tracks.filter((track) => track.stage === 'error')
  const activeTrackIndex = job.tracks.findIndex(
    (track) => !['done', 'error', 'cancelled'].includes(track.stage),
  )
  const activeTrack = activeTrackIndex >= 0 ? job.tracks[activeTrackIndex] : null
  const canReorder = job.status !== 'running' && onReorder

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">{job.title}</p>
          <p className="text-xs text-text-secondary">
            {completed} / {job.tracks.length} tracks · {job.mode === 'zip' ? 'ZIP mode' : 'Individual'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {canReorder ? (
            <>
              <button
                type="button"
                disabled={isFirst}
                onClick={() => onReorder('up')}
                className="rounded-lg px-2 py-1 text-xs text-text-secondary disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => onReorder('down')}
                className="rounded-lg px-2 py-1 text-xs text-text-secondary disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
            </>
          ) : null}
          {job.status === 'running' && onCancel ? (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          {['complete', 'error', 'cancelled'].includes(job.status) && onDismiss ? (
            <Button variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          ) : null}
        </div>
      </div>

      {activeTrack ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-accent">
            {stageLabels[activeTrack.stage]} · Track {activeTrackIndex + 1} of {job.tracks.length}
          </p>
          <p className="truncate text-sm text-text-primary">{activeTrack.entry.title}</p>
          <p className="text-xs text-text-secondary">{activeTrack.message}</p>
          <Progress value={activeTrack.percent} />
        </div>
      ) : null}

      {failed.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-danger/30 bg-danger/5 p-3">
          <p className="text-xs font-medium text-danger">
            {failed.length} track{failed.length > 1 ? 's' : ''} failed
          </p>
          {failed.map((track) => (
            <p key={track.entry.id} className="truncate text-xs text-text-secondary">
              {track.entry.title}
              {track.error ? ` — ${track.error}` : ''}
            </p>
          ))}
          {onRetryFailed ? (
            <Button variant="secondary" fullWidth onClick={onRetryFailed}>
              Retry failed ({failed.length})
            </Button>
          ) : null}
        </div>
      ) : null}

      {job.status === 'complete' && job.mode === 'zip' && job.zipUrl ? (
        <Button fullWidth variant="secondary" onClick={onRetryZip}>
          Download ZIP
        </Button>
      ) : null}
    </Card>
  )
}
