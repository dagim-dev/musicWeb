import { SaveCancelledError } from '@/utils/errors'
import { isNativeApp, saveBlobToDgLabs } from '@/utils/nativeFileSave'

export type SaveResult =
  | { kind: 'native'; path: string; uri: string | null }
  | { kind: 'file-handle'; handle: FileSystemFileHandle }
  | { kind: 'session-blob'; blob: Blob }

async function saveBlobWeb(blob: Blob, fileName: string, mimeType = 'audio/mpeg'): Promise<SaveResult> {
  const savePicker = window.showSaveFilePicker

  if (savePicker) {
    try {
      const handle = await savePicker({
        suggestedName: fileName,
        types: [{ description: 'Audio', accept: { [mimeType]: ['.mp3'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return { kind: 'file-handle', handle }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new SaveCancelledError()
      }
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
  return { kind: 'session-blob', blob }
}

export async function saveBlob(blob: Blob, fileName: string, mimeType = 'audio/mpeg'): Promise<SaveResult> {
  if (isNativeApp()) {
    const saved = await saveBlobToDgLabs(blob, fileName)
    return { kind: 'native', path: saved.path, uri: saved.uri }
  }

  return saveBlobWeb(blob, fileName, mimeType)
}
