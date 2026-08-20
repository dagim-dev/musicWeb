import { Pause, Play, SkipForward } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Artwork } from '@/components/ui/Artwork'
import { IconButton } from '@/components/ui/IconButton'
import { skipBy } from '@/features/player/useAudioPlayer'
import { getTrack } from '@/db/libraryRepository'
import { usePlayerStore } from '@/stores/playerStore'

export function MiniPlayer() {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const position = usePlayerStore((s) => s.position)
  const duration = usePlayerStore((s) => s.duration)
  const error = usePlayerStore((s) => s.error)
  const setPlaying = usePlayerStore((s) => s.setPlaying)
  const setExpanded = usePlayerStore((s) => s.setExpanded)

  const trackQuery = useQuery({
    queryKey: ['player-track', currentTrackId],
    enabled: Boolean(currentTrackId),
    queryFn: () => getTrack(currentTrackId!),
  })

  if (!currentTrackId || !trackQuery.data) return null
  const track = trackQuery.data
  const percent = duration > 0 ? (position / duration) * 100 : 0

  return (
    <div className="z-20 border-t border-border bg-surface/95 px-3 py-2 backdrop-blur">
      <div className="mb-2 h-0.5 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => setExpanded(true)}
        >
          <Artwork src={track.thumbnailUrl} blob={track.thumbnailBlob} className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{track.title}</p>
            <p className="truncate text-xs text-text-secondary">{error ?? track.artist}</p>
          </div>
        </button>
        <IconButton
          label={isPlaying ? 'Pause' : 'Play'}
          variant="accent"
          size="sm"
          onClick={() => setPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
        </IconButton>
        <IconButton label="Next track" onClick={() => skipBy(1)}>
          <SkipForward className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  )
}
