const MAX_THUMBNAIL_BYTES = 500_000

export async function fetchThumbnailBlob(url: string | null): Promise<Blob | null> {
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    if (blob.size > MAX_THUMBNAIL_BYTES) return null
    return blob
  } catch {
    return null
  }
}
