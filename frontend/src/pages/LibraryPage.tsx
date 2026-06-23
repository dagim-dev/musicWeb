import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { TrackCard } from '@/components/library/TrackCard'
import { Toast } from '@/components/ui/Toast'
import { deleteTrack, getAllTracks, searchTracks } from '@/db/libraryRepository'
import { useStartDownload } from '@/hooks/useStartDownload'
import type { TrackRecord } from '@/db/schema'

export function LibraryPage() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'artist' | 'album'>('date')
  const [toast, setToast] = useState<{ message: string; variant: 'info' | 'success' | 'error' } | null>(
    null,
  )
  const queryClient = useQueryClient()
  const { startDownload } = useStartDownload()

  const tracksQuery = useQuery({
    queryKey: ['library', sortBy],
    queryFn: () => getAllTracks(sortBy),
  })

  const searchQuery = useQuery({
    queryKey: ['library-search', query],
    enabled: query.trim().length > 0,
    queryFn: () => searchTracks(query.trim()),
  })

  const tracks = useMemo(() => {
    if (query.trim()) return searchQuery.data ?? []
    return tracksQuery.data ?? []
  }, [query, searchQuery.data, tracksQuery.data])

  const handleRedownload = async (track: TrackRecord) => {
    const url = track.sourceUrl || `https://www.youtube.com/watch?v=${track.youtubeId}`
    try {
      await startDownload({
        url,
        title: track.title,
        album: track.album,
        entries: [
          {
            id: track.youtubeId,
            title: track.title,
            artist: track.artist,
            duration: track.duration,
            thumbnail: track.thumbnailUrl,
            track_number: track.trackNumber,
          },
        ],
        mode: 'individual',
        switchToHome: true,
      })
      setToast({
        message: 'Re-download started. Check the Download tab for progress.',
        variant: 'success',
      })
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to start re-download',
        variant: 'error',
      })
    }
  }

  return (
    <div className="space-y-5 p-4 pb-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Library</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your download history is stored locally and works offline.
        </p>
      </header>

      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, artist, album"
          className="flex-1 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm outline-none ring-accent focus:ring-2"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as 'date' | 'artist' | 'album')}
          className="rounded-xl border border-border bg-surface-muted px-3 text-sm text-text-primary"
        >
          <option value="date">Date</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
        </select>
      </div>

      {tracksQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-surface-muted" />
          ))}
        </div>
      ) : tracks.length ? (
        <div className="space-y-3">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onRedownload={() => void handleRedownload(track)}
              onDelete={() => {
                void deleteTrack(track.id).then(() => {
                  void queryClient.invalidateQueries({ queryKey: ['library'] })
                })
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium text-text-primary">No downloads yet</p>
          <p className="mt-1 text-xs text-text-secondary">
            Downloaded tracks will appear here with cover art and metadata.
          </p>
        </div>
      )}

      <Toast
        message={toast?.message ?? ''}
        visible={Boolean(toast)}
        variant={toast?.variant ?? 'info'}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
