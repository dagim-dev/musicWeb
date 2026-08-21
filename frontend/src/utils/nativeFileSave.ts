import { Capacitor, registerPlugin } from '@capacitor/core'

export const DGLABS_FOLDER = 'DgLabs'
export const DGLABS_DOWNLOAD_PATH = `Download/${DGLABS_FOLDER}`

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

interface DgLabsSaverPlugin {
  saveAudioFile(options: { fileName: string; data: string }): Promise<{ path: string }>
}

const DgLabsSaver = registerPlugin<DgLabsSaverPlugin>('DgLabsSaver')

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

export async function saveBlobToDgLabs(blob: Blob, fileName: string): Promise<string> {
  const data = await blobToBase64(blob)
  const result = await DgLabsSaver.saveAudioFile({ fileName, data })
  return result.path
}

export function getSaveLocationMessage(): string {
  if (isNativeApp()) {
    return `Saved to Downloads/${DGLABS_FOLDER}.`
  }
  return 'Saved to Downloads.'
}
