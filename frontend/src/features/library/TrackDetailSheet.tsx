import { Pause, Play } from 'lucide-react'
import type { TrackRecord } from '@/db/schema'
import { Artwork } from '@/components/ui/Artwork'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { isPlaybackAvailable } from '@/features/player/playbackAvailability'
import { formatDate, formatDuration, formatFileSize } from '@/utils/format'

interface TrackDetailSheetProps {
  track: TrackRecord | null
  onClose: () => void
  onPlay: () => void
  onRedownload: () => void
  onDelete: () => void
  onRelink: () => void
  playing?: boolean
}

export function TrackDetailSheet({
  track,
  onClose,
  onPlay,
  onRedownload,
  onDelete,
  onRelink,
  playing,
}: TrackDetailSheetProps) {
  const unavailable = Boolean(track && !isPlaybackAvailable(track))

  return (
    <Sheet open={Boolean(track)} onClose={onClose} title={track?.title ?? 'Track'}>
      {track ? (
        <div className="space-y-4">
          <Artwork
            src={track.thumbnailUrl}
            blob={track.thumbnailBlob}
            className="mx-auto aspect-square w-56 max-w-full rounded-2xl"
          />
          <div className="text-center">
            <p className="text-lg font-bold text-text-primary">{track.title}</p>
            <p className="text-sm text-text-secondary">{track.artist}</p>
            {track.album ? <p className="text-xs text-text-secondary">{track.album}</p> : null}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-text-secondary">Duration</dt>
              <dd>{formatDuration(track.duration)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Downloaded</dt>
              <dd>{formatDate(track.downloadedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Size</dt>
              <dd>{track.fileSize ? formatFileSize(track.fileSize) : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">File</dt>
              <dd className="truncate">{track.fileName}</dd>
            </div>
          </dl>
          {unavailable ? (
            <p className="rounded-xl bg-surface-muted px-3 py-2 text-xs text-text-secondary">
              Playback needs a local file link. Relink the MP3, or re-download it.
            </p>
          ) : null}
          <div className="space-y-2">
            <Button fullWidth onClick={onPlay} disabled={unavailable && !window.showOpenFilePicker}>
              {playing ? (
                <>
                  <Pause className="h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" /> Play
                </>
              )}
            </Button>
            {unavailable ? (
              <Button variant="secondary" fullWidth onClick={onRelink}>
                Relink file
              </Button>
            ) : null}
            <Button variant="secondary" fullWidth onClick={onRedownload}>
              Re-download
            </Button>
            <Button variant="danger" fullWidth onClick={onDelete}>
              Delete from library
            </Button>
          </div>
        </div>
      ) : null}
    </Sheet>
  )
}
