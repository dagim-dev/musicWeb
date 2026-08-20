import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cancelJob } from '@/api/client'
import { Artwork } from '@/components/ui/Artwork'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { WaveformProgress } from '@/components/ui/WaveformProgress'
import {
  activeTrack,
  displayTrackPercent,
  jobProgress,
  trackStageLabel,
} from '@/features/queue/queueUtils'
import { classifyError } from '@/utils/errors'
import type { QueueJob } from '@/stores/downloadQueueStore'

interface QueueJobCardProps {
  job: QueueJob
  featured?: boolean
  isFirst?: boolean
  isLast?: boolean
  onCancel: () => void
  onRetryFailed: () => void
  onRetryZip?: () => void
  onReorder?: (direction: 'up' | 'down') => void
  onDismiss: () => void
}

export function QueueJobCard({
  job,
  featured,
  isFirst,
  isLast,
  onCancel,
  onRetryFailed,
  onRetryZip,
  onReorder,
  onDismiss,
}: QueueJobCardProps) {
  const [expanded, setExpanded] = useState(featured ?? job.status === 'error')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const progress = jobProgress(job)
  const current = activeTrack(job)
  const cover = current?.track.entry.thumbnail ?? job.tracks[0]?.entry.thumbnail
  const failed = job.tracks.filter((track) => track.stage === 'error' || track.saveStatus === 'error')
  const running = job.status === 'running' || job.status === 'pending'

  return (
    <Card className="space-y-4">
      <div className="flex min-w-0 items-start gap-3">
        <Artwork src={cover} className={featured ? 'h-20 w-20 shrink-0 rounded-xl' : 'h-14 w-14 shrink-0 rounded-xl'} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-text-primary">{job.title}</p>
          <p className="truncate text-xs text-text-secondary">
            {progress.completed}/{job.tracks.length} saved
            {job.album ? ` · ${job.album}` : ''}
            {` · ${job.mode === 'zip' ? 'ZIP' : 'Files'}`}
          </p>
          {current ? (
            <p className="mt-1 truncate text-xs font-medium text-accent">
              {trackStageLabel(current.track)} · {current.track.resolvedTitle ?? current.track.entry.title}
            </p>
          ) : null}
        </div>
        <p className="tabular shrink-0 text-sm font-semibold text-text-primary">{progress.percent}%</p>
      </div>

      <WaveformProgress value={progress.percent} active={running} />

      {failed.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-danger/30 bg-danger/5 p-3">
          <p className="text-xs font-semibold text-danger">
            {failed.length} track{failed.length > 1 ? 's' : ''} need attention
          </p>
          {failed.slice(0, expanded ? failed.length : 3).map((track) => {
            const info = classifyError(track.saveError ?? track.error ?? 'Failed')
            return (
              <p key={track.entry.id} className="break-words text-xs text-text-secondary">
                {track.entry.title} — {info.title}. {info.hint}
              </p>
            )
          })}
          <Button variant="secondary" fullWidth onClick={onRetryFailed}>
            Retry failed ({failed.length})
          </Button>
        </div>
      ) : null}

      {expanded ? (
        <ol className="space-y-2">
          {job.tracks.map((track, index) => (
            <li key={`${track.entry.id}-${index}`} className="flex min-w-0 items-center gap-3 text-sm">
              <Artwork src={track.entry.thumbnail} className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-text-primary">{track.resolvedTitle ?? track.entry.title}</p>
                <p className="text-xs text-text-secondary">{trackStageLabel(track)}</p>
              </div>
              <span className="tabular text-xs text-text-secondary">{displayTrackPercent(track)}%</span>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Hide tracks' : 'Show tracks'}
        </Button>
        {running ? (
          <Button variant="danger" onClick={() => setConfirmCancel(true)}>
            Cancel job
          </Button>
        ) : (
          <Button variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
        {job.status === 'complete' && job.mode === 'zip' && onRetryZip ? (
          <Button variant="secondary" onClick={onRetryZip}>
            Download ZIP
          </Button>
        ) : null}
        {job.status !== 'running' && onReorder ? (
          <>
            <button
              type="button"
              disabled={isFirst}
              onClick={() => onReorder('up')}
              className="rounded-lg p-2 text-text-secondary disabled:opacity-30"
              aria-label="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={() => onReorder('down')}
              className="rounded-lg p-2 text-text-secondary disabled:opacity-30"
              aria-label="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this download?"
        message="Tracks already saved to your device stay in the library. Unfinished tracks will stop."
        confirmLabel="Cancel download"
        danger
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false)
          void cancelJob(job.id).finally(onCancel)
        }}
      />
    </Card>
  )
}
