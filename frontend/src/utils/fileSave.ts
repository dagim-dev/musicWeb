import { isNativeApp, saveBlobToDgLabs } from '@/utils/nativeFileSave'

async function saveBlobWeb(blob: Blob, fileName: string, mimeType = 'audio/mpeg') {
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

export async function saveBlob(blob: Blob, fileName: string, mimeType = 'audio/mpeg') {
  if (isNativeApp()) {
    await saveBlobToDgLabs(blob, fileName)
    return
  }

  await saveBlobWeb(blob, fileName, mimeType)
}
