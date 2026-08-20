import { Play } from 'lucide-react'
import type { TrackRecord } from '@/db/schema'
import { Artwork } from '@/components/ui/Artwork'
import { IconButton } from '@/components/ui/IconButton'
import { formatDate } from '@/utils/format'

interface TrackRowProps {
  track: TrackRecord
  onOpen: () => void
  onPlay: () => void
}

export function TrackRow({ track, onOpen, onPlay }: TrackRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-3">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <Artwork src={track.thumbnailUrl} blob={track.thumbnailBlob} className="h-14 w-14 rounded-xl" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{track.title}</p>
          <p className="truncate text-xs text-text-secondary">
            {track.artist}
            {track.album ? ` · ${track.album}` : ''}
          </p>
          <p className="mt-1 text-[11px] text-text-secondary">{formatDate(track.downloadedAt)}</p>
        </div>
      </button>
      <IconButton label={`Play ${track.title}`} variant="accent" size="sm" onClick={onPlay}>
        <Play className="h-4 w-4 fill-current" />
      </IconButton>
    </div>
  )
}
