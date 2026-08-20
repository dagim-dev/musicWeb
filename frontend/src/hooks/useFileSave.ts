import { useCallback } from 'react'
import { trackFileUrl, zipFileUrl } from '@/api/client'
import { addDownloadHistory, addTrack, getSetting } from '@/db/libraryRepository'
import type { PlaybackKind, TrackRecord } from '@/db/schema'
import { setSessionBlob } from '@/features/player/sessionBlobs'
import { saveBlob } from '@/utils/fileSave'
import { applyFilenameTemplate } from '@/utils/filenameTemplate'
import { fetchThumbnailBlob } from '@/utils/thumbnails'

export function useFileSave() {
  const saveTrackFile = useCallback(
    async (params: {
      jobId: string
      index: number
      youtubeId: string
      title: string
      artist: string
      album: string | null
      trackNumber: number | null
      duration: number | null
      thumbnailUrl: string | null
      sourceUrl: string
      fileName: string
    }) => {
      const response = await fetch(trackFileUrl(params.jobId, params.index))
      if (!response.ok) throw new Error('Failed to download file')

      const blob = await response.blob()
      const template = await getSetting('filenameTemplate', '{artist} - {title}.mp3')
      const fileName = applyFilenameTemplate(template, {
        artist: params.artist,
        title: params.title,
        album: params.album,
      })
      const saved = await saveBlob(blob, fileName)

      const thumbnailBlob = await fetchThumbnailBlob(params.thumbnailUrl)
      const trackId = crypto.randomUUID()

      let playbackKind: PlaybackKind = 'unavailable'
      let nativePath: string | null = null
      let nativeUri: string | null = null
      let fileHandle: FileSystemFileHandle | null = null
      let fileAvailable = false

      if (saved.kind === 'native') {
        playbackKind = 'native'
        nativePath = saved.path
        nativeUri = saved.uri
        fileAvailable = true
        setSessionBlob(trackId, blob)
      } else if (saved.kind === 'file-handle') {
        playbackKind = 'file-handle'
        fileHandle = saved.handle
        fileAvailable = true
        setSessionBlob(trackId, blob)
      } else {
        playbackKind = 'session'
        fileAvailable = true
        setSessionBlob(trackId, blob)
      }

      const track: TrackRecord = {
        id: trackId,
        youtubeId: params.youtubeId,
        title: params.title,
        artist: params.artist,
        album: params.album,
        trackNumber: params.trackNumber,
        duration: params.duration,
        thumbnailUrl: params.thumbnailUrl,
        thumbnailBlob,
        fileName,
        fileSize: blob.size,
        downloadedAt: new Date().toISOString(),
        sourceUrl: params.sourceUrl,
        playbackKind,
        nativePath,
        nativeUri,
        fileHandle,
        fileAvailable,
      }

      await addTrack(track)
      await addDownloadHistory({
        id: crypto.randomUUID(),
        jobId: params.jobId,
        trackId,
        status: 'complete',
        completedAt: new Date().toISOString(),
        error: null,
      })

      return track
    },
    [],
  )

  const saveZipFile = useCallback(async (jobId: string) => {
    const response = await fetch(zipFileUrl(jobId))
    if (!response.ok) throw new Error('Failed to download ZIP')
    const blob = await response.blob()
    await saveBlob(blob, 'playlist.zip', 'application/zip')
    return blob
  }, [])

  return { saveTrackFile, saveZipFile }
}
