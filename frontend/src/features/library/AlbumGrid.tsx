import { Play } from 'lucide-react'
import type { TrackRecord } from '@/db/schema'
import { Artwork } from '@/components/ui/Artwork'

interface AlbumGridProps {
  tracks: TrackRecord[]
  onOpen: (track: TrackRecord) => void
  onPlay: (track: TrackRecord) => void
}

export function AlbumGrid({ tracks, onOpen, onPlay }: AlbumGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {tracks.map((track) => (
        <article key={track.id} className="group">
          <div className="relative">
            <button type="button" onClick={() => onOpen(track)} className="w-full text-left">
              <Artwork
                src={track.thumbnailUrl}
                blob={track.thumbnailBlob}
                className="aspect-square w-full rounded-2xl transition duration-200 group-hover:scale-[1.02]"
              />
              <p className="mt-2 truncate text-sm font-semibold text-text-primary">{track.title}</p>
              <p className="truncate text-xs text-text-secondary">{track.artist}</p>
            </button>
            <button
              type="button"
              aria-label={`Play ${track.title}`}
              className="absolute top-2 right-2 hidden h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground md:group-hover:flex"
              onClick={() => onPlay(track)}
            >
              <Play className="h-4 w-4 fill-current" />
            </button>
          </div>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-accent md:hidden"
            onClick={() => onPlay(track)}
          >
            Play
          </button>
        </article>
      ))}
    </div>
  )
}
