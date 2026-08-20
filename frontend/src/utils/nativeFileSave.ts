import { Capacitor, registerPlugin } from '@capacitor/core'

export const DGLABS_FOLDER = 'DgLabs'
export const DGLABS_DOWNLOAD_PATH = `Download/${DGLABS_FOLDER}`

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

interface DgLabsSaverPlugin {
  saveAudioFile(options: { fileName: string; data: string }): Promise<{ path: string; uri?: string }>
  readAudioFile(options: { uri?: string; path?: string; fileName?: string }): Promise<{ data: string }>
}

export const DgLabsSaver = registerPlugin<DgLabsSaverPlugin>('DgLabsSaver')

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

export function base64ToBlob(data: string, mimeType = 'audio/mpeg'): Blob {
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}

export async function saveBlobToDgLabs(blob: Blob, fileName: string): Promise<{ path: string; uri: string | null }> {
  const data = await blobToBase64(blob)
  const result = await DgLabsSaver.saveAudioFile({ fileName, data })
  return { path: result.path, uri: result.uri || null }
}

export function getSaveLocationMessage(): string {
  if (isNativeApp()) {
    return `Saved to Downloads/${DGLABS_FOLDER}.`
  }
  return 'Saved to Downloads.'
}
