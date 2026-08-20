import type { TrackRecord } from '@/db/schema'
import { PlaybackUnavailableError } from '@/utils/errors'
import { base64ToBlob, DgLabsSaver, isNativeApp } from '@/utils/nativeFileSave'
import { getSessionObjectUrl, setSessionBlob } from '@/features/player/sessionBlobs'

export async function resolvePlaybackUrl(track: TrackRecord): Promise<string> {
  const sessionUrl = getSessionObjectUrl(track.id)
  if (sessionUrl) return sessionUrl

  if (track.playbackKind === 'file-handle' && track.fileHandle) {
    const query = track.fileHandle.queryPermission?.({ mode: 'read' })
    const current = query ? await query : 'granted'
    if (current !== 'granted') {
      const next = (await track.fileHandle.requestPermission?.({ mode: 'read' })) ?? 'denied'
      if (next !== 'granted') {
        throw new PlaybackUnavailableError('File permission denied. Relink the MP3 to play it.')
      }
    }
    const file = await track.fileHandle.getFile()
    setSessionBlob(track.id, file)
    return getSessionObjectUrl(track.id) ?? URL.createObjectURL(file)
  }

  if (track.playbackKind === 'native' && isNativeApp()) {
    const result = await DgLabsSaver.readAudioFile({
      uri: track.nativeUri ?? undefined,
      path: track.nativePath ?? undefined,
      fileName: track.fileName,
    })
    const blob = base64ToBlob(result.data)
    setSessionBlob(track.id, blob)
    const url = getSessionObjectUrl(track.id)
    if (!url) throw new PlaybackUnavailableError()
    return url
  }

  throw new PlaybackUnavailableError()
}

export async function relinkAudioFile(): Promise<FileSystemFileHandle> {
  if (!window.showOpenFilePicker) {
    throw new PlaybackUnavailableError('This browser cannot relink files. Re-download the track instead.')
  }
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: 'Audio', accept: { 'audio/mpeg': ['.mp3'] } }],
    multiple: false,
  })
  if (!handle) throw new PlaybackUnavailableError('No file selected')
  return handle
}
