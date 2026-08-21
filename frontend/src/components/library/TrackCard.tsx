import type { TrackRecord } from '@/db/schema'
import { Artwork } from '@/components/ui/Artwork'
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
    <Card interactive className="flex min-w-0 items-center gap-3 p-3">
      <Artwork src={thumbnailSrc} alt="" size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{track.title}</p>
        <p className="truncate text-xs text-text-secondary">
          {track.artist}
          {track.album ? ` · ${track.album}` : ''}
        </p>
        <p className="mt-1 text-[11px] text-text-secondary">{formatDate(track.downloadedAt)}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
        {onRedownload ? (
          <button
            type="button"
            onClick={onRedownload}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/10"
            title="Re-download"
          >
            <span className="hidden sm:inline">Re-download</span>
            <span className="sm:hidden" aria-label="Re-download">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto h-4 w-4">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10"
            title="Delete"
          >
            <span className="hidden sm:inline">Delete</span>
            <span className="sm:hidden" aria-label="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto h-4 w-4">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        ) : null}
      </div>
    </Card>
  )
}
