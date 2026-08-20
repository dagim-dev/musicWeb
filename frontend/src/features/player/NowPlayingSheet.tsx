import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Artwork } from '@/components/ui/Artwork'
import { IconButton } from '@/components/ui/IconButton'
import { Sheet } from '@/components/ui/Sheet'
import { seekTo, skipBy } from '@/features/player/useAudioPlayer'
import { getTrack } from '@/db/libraryRepository'
import { usePlayerStore } from '@/stores/playerStore'
import { formatClock } from '@/utils/format'

export function NowPlayingSheet() {
  const expanded = usePlayerStore((s) => s.expanded)
  const currentTrackId = usePlayerStore((s) => s.currentTrackId)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const position = usePlayerStore((s) => s.position)
  const duration = usePlayerStore((s) => s.duration)
  const error = usePlayerStore((s) => s.error)
  const queue = usePlayerStore((s) => s.queue)
  const setPlaying = usePlayerStore((s) => s.setPlaying)
  const setExpanded = usePlayerStore((s) => s.setExpanded)

  const trackQuery = useQuery({
    queryKey: ['player-track', currentTrackId],
    enabled: Boolean(currentTrackId),
    queryFn: () => getTrack(currentTrackId!),
  })

  const track = trackQuery.data
  const index = queue.indexOf(currentTrackId ?? '')

  return (
    <Sheet
      open={expanded && Boolean(track)}
      onClose={() => setExpanded(false)}
      title="Now playing"
      size="full"
    >
      {track ? (
        <div className="mx-auto flex w-full min-w-0 max-w-md flex-col items-center gap-6 pt-2">
          <div className="relative w-full min-w-0 max-w-[55vh] overflow-hidden rounded-3xl">
            {track.thumbnailUrl ? (
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <img src={track.thumbnailUrl} alt="" className="h-full w-full scale-125 object-cover opacity-20" />
              </div>
            ) : null}
            <Artwork
              src={track.thumbnailUrl}
              blob={track.thumbnailBlob}
              className="aspect-square w-full rounded-3xl"
            />
          </div>
          <div className="w-full min-w-0 text-center">
            <h3 className="break-words text-2xl font-extrabold text-text-primary">{track.title}</h3>
            <p className="mt-1 break-words text-sm text-text-secondary">{track.artist}</p>
            {error ? <p className="mt-2 break-words text-xs text-danger">{error}</p> : null}
          </div>
          <label className="w-full">
            <span className="sr-only">Seek</span>
            <input
              type="range"
              min={0}
              max={Math.max(duration, 0.1)}
              step={0.1}
              value={position}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-xs text-text-secondary tabular">
              <span>{formatClock(position)}</span>
              <span>-{formatClock(Math.max(duration - position, 0))}</span>
            </div>
          </label>
          <div className="flex items-center gap-6">
            <IconButton label="Previous track" onClick={() => skipBy(-1)} disabled={index <= 0}>
              <SkipBack className="h-7 w-7" />
            </IconButton>
            <IconButton
              label={isPlaying ? 'Pause' : 'Play'}
              variant="accent"
              size="lg"
              onClick={() => setPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current" />}
            </IconButton>
            <IconButton label="Next track" onClick={() => skipBy(1)} disabled={index < 0 || index >= queue.length - 1}>
              <SkipForward className="h-7 w-7" />
            </IconButton>
          </div>
          {queue.length > 1 ? (
            <p className="text-xs text-text-secondary">
              Track {index + 1} of {queue.length} in this session
            </p>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  )
}
