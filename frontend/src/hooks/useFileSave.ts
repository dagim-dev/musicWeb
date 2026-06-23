import { useCallback } from 'react'
import { trackFileUrl, zipFileUrl } from '@/api/client'
import { addDownloadHistory, addTrack, getSetting } from '@/db/libraryRepository'
import { applyFilenameTemplate } from '@/utils/filenameTemplate'

async function saveBlob(blob: Blob, fileName: string, mimeType = 'audio/mpeg') {
  const savePicker = (
    window as Window & {
      showSaveFilePicker?: (options: {
        suggestedName: string
        types: Array<{ description: string; accept: Record<string, string[]> }>
      }) => Promise<FileSystemFileHandle>
    }
  ).showSaveFilePicker

  if (savePicker) {
    try {
      const handle = await savePicker({
        suggestedName: fileName,
        types: [{ description: 'Audio', accept: { [mimeType]: ['.mp3'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function triggerDownload(blob: Blob, fileName: string) {
  void saveBlob(blob, fileName)
}

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
      await saveBlob(blob, fileName)

      let thumbnailBlob: Blob | null = null
      if (params.thumbnailUrl) {
        try {
          const thumbResponse = await fetch(params.thumbnailUrl)
          if (thumbResponse.ok) thumbnailBlob = await thumbResponse.blob()
        } catch {
          thumbnailBlob = null
        }
      }

      const trackId = crypto.randomUUID()
      await addTrack({
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
      })

      await addDownloadHistory({
        id: crypto.randomUUID(),
        jobId: params.jobId,
        trackId,
        status: 'complete',
        completedAt: new Date().toISOString(),
        error: null,
      })

      return blob
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

  return { saveTrackFile, saveZipFile, triggerDownload }
}
