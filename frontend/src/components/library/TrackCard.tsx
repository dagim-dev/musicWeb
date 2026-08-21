import type { TrackRecord } from '@/db/schema'
import { Card } from '@/components/ui/Card'
import { useEffect, useState } from 'react'

interface TrackCardProps {
  track: TrackRecord
  onDelete?: () => void
  onRedownload?: () => void
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function TrackCard({ track, onDelete, onRedownload }: TrackCardProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(track.thumbnailUrl)

  useEffect(() => {
    if (track.thumbnailBlob) {
      const objectUrl = URL.createObjectURL(track.thumbnailBlob)
      setThumbnailSrc(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
    setThumbnailSrc(track.thumbnailUrl)
  }, [track.thumbnailBlob, track.thumbnailUrl])

  return (
    <Card className="flex items-center gap-3 p-3">
      {thumbnailSrc ? (
        <img src={thumbnailSrc} alt="" className="h-14 w-14 rounded-xl object-cover" />
      ) : (
        <div className="h-14 w-14 rounded-xl bg-surface-muted" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{track.title}</p>
        <p className="truncate text-xs text-text-secondary">
          {track.artist}
          {track.album ? ` · ${track.album}` : ''}
        </p>
        <p className="mt-1 text-[11px] text-text-secondary">{formatDate(track.downloadedAt)}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {onRedownload ? (
          <button
            type="button"
            onClick={onRedownload}
            className="rounded-lg px-2 py-1 text-xs text-accent"
          >
            Re-download
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg px-2 py-1 text-xs text-danger"
          >
            Delete
          </button>
        ) : null}
      </div>
    </Card>
  )
}
