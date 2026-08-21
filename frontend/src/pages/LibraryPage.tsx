import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { TrackCard } from '@/components/library/TrackCard'
import { Toast } from '@/components/ui/Toast'
import { deleteTrack, getAllTracks, searchTracks } from '@/db/libraryRepository'
import { useStartDownload } from '@/hooks/useStartDownload'
import type { TrackRecord } from '@/db/schema'
import { formatFileSize } from '@/utils/samsungMusic'

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

  const libraryStats = useMemo(() => {
    const all = tracksQuery.data ?? []
    return {
      count: all.length,
      totalBytes: all.reduce((sum, track) => sum + (track.fileSize ?? 0), 0),
    }
  }, [tracksQuery.data])

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
    <div className="min-w-0 space-y-5 pb-6 pt-4">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Library</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your download history is stored locally and works offline.
        </p>
        {libraryStats.count > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              {libraryStats.count} {libraryStats.count === 1 ? 'track' : 'tracks'}
            </span>
            {libraryStats.totalBytes > 0 ? (
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-text-secondary">
                {formatFileSize(libraryStats.totalBytes)} downloaded
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, artist, album"
          className="w-full min-w-0 flex-1 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/30"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as 'date' | 'artist' | 'album')}
          className="w-full shrink-0 rounded-xl border border-border bg-surface-muted px-3 py-3 text-sm text-text-primary sm:w-auto"
        >
          <option value="date">Date</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
        </select>
      </div>

      {tracksQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-shimmer h-20 rounded-2xl" />
          ))}
        </div>
      ) : tracks.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-text-secondary/50">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            </svg>
          </div>
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
