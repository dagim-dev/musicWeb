import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AlbumGrid } from '@/features/library/AlbumGrid'
import { LibraryToolbar, type LibrarySort, type LibraryView } from '@/features/library/LibraryToolbar'
import { TrackDetailSheet } from '@/features/library/TrackDetailSheet'
import { TrackRow } from '@/features/library/TrackRow'
import { relinkAudioFile } from '@/features/player/playbackAdapter'
import { deleteTrack, getAllTracks, searchTracks, updateTrack } from '@/db/libraryRepository'
import type { TrackRecord } from '@/db/schema'
import { useStartDownload } from '@/hooks/useStartDownload'
import { usePlayerStore } from '@/stores/playerStore'
import { useToastStore } from '@/stores/toastStore'
import { formatFileSize } from '@/utils/format'

export function LibraryPage() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<LibrarySort>('date')
  const [view, setView] = useState<LibraryView>('grid')
  const [selected, setSelected] = useState<TrackRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TrackRecord | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { startDownload } = useStartDownload()
  const showToast = useToastStore((s) => s.show)
  const setCurrent = usePlayerStore((s) => s.setCurrent)
  const currentTrackId = usePlayerStore((s) => s.currentTrackId)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

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

  const stats = useMemo(() => {
    const all = tracksQuery.data ?? []
    return {
      count: all.length,
      totalBytes: all.reduce((sum, track) => sum + (track.fileSize ?? 0), 0),
    }
  }, [tracksQuery.data])

  const playTrack = (track: TrackRecord) => {
    const queue = tracks.map((item) => item.id)
    setCurrent(track.id, queue)
    usePlayerStore.getState().setPlaying(true)
    setSelected(null)
  }

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
      })
      showToast({ message: 'Re-download started. Check the Queue tab.', variant: 'success' })
      setSelected(null)
      void navigate('/queue')
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to start re-download',
        variant: 'error',
      })
    }
  }

  const handleRelink = async (track: TrackRecord) => {
    try {
      const handle = await relinkAudioFile()
      await updateTrack(track.id, {
        playbackKind: 'file-handle',
        fileHandle: handle,
        fileAvailable: true,
      })
      await queryClient.invalidateQueries({ queryKey: ['library'] })
      setSelected({ ...track, playbackKind: 'file-handle', fileHandle: handle, fileAvailable: true })
      showToast({ message: 'File relinked.', variant: 'success' })
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Could not relink file',
        variant: 'error',
      })
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-5 p-4 pb-8 lg:p-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Library</p>
        <h1 className="mt-1 text-3xl font-extrabold text-text-primary">Saved locally</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your download history lives on this device and works offline.
        </p>
        {stats.count > 0 ? (
          <p className="mt-2 text-xs text-text-secondary">
            {stats.count} {stats.count === 1 ? 'track' : 'tracks'}
            {stats.totalBytes > 0 ? ` · ${formatFileSize(stats.totalBytes)}` : ''}
          </p>
        ) : null}
      </header>

      <LibraryToolbar
        query={query}
        sortBy={sortBy}
        view={view}
        onQueryChange={setQuery}
        onSortChange={setSortBy}
        onViewChange={setView}
      />

      {tracksQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-2xl bg-surface-muted" />
          ))}
        </div>
      ) : tracks.length ? (
        view === 'grid' ? (
          <AlbumGrid tracks={tracks} onOpen={setSelected} onPlay={playTrack} />
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                onOpen={() => setSelected(track)}
                onPlay={() => playTrack(track)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold text-text-primary">
            {query.trim() ? 'No matching tracks' : 'No downloads yet'}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {query.trim()
              ? 'Try a different title, artist, or album.'
              : 'Paste a YouTube link on Home to save 320 kbps MP3s here.'}
          </p>
          {!query.trim() ? (
            <Button className="mt-4" onClick={() => void navigate('/')}>
              Analyze a link
            </Button>
          ) : null}
        </div>
      )}

      <TrackDetailSheet
        track={selected}
        onClose={() => setSelected(null)}
        onPlay={() => selected && playTrack(selected)}
        onRedownload={() => selected && void handleRedownload(selected)}
        onDelete={() => setPendingDelete(selected)}
        onRelink={() => selected && void handleRelink(selected)}
        playing={Boolean(selected && currentTrackId === selected.id && isPlaying)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this track?"
        message="This removes it from the DgLabs library. The MP3 file on disk is not deleted."
        confirmLabel="Remove"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          void deleteTrack(pendingDelete.id).then(() => {
            void queryClient.invalidateQueries({ queryKey: ['library'] })
            setPendingDelete(null)
            setSelected(null)
          })
        }}
      />
    </div>
  )
}
