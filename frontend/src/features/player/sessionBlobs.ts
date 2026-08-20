const blobs = new Map<string, Blob>()
const urls = new Map<string, string>()

export function setSessionBlob(trackId: string, blob: Blob) {
  revokeSessionUrl(trackId)
  blobs.set(trackId, blob)
}

export function getSessionBlob(trackId: string): Blob | null {
  return blobs.get(trackId) ?? null
}

export function getSessionObjectUrl(trackId: string): string | null {
  const blob = blobs.get(trackId)
  if (!blob) return null
  const existing = urls.get(trackId)
  if (existing) return existing
  const url = URL.createObjectURL(blob)
  urls.set(trackId, url)
  return url
}

export function revokeSessionUrl(trackId: string) {
  const url = urls.get(trackId)
  if (url) URL.revokeObjectURL(url)
  urls.delete(trackId)
}
