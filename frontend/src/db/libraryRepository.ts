import { db, type PlaybackKind, type TrackRecord } from './schema'

export async function findTrackByYoutubeId(youtubeId: string): Promise<TrackRecord | undefined> {
  return db.tracks.where('youtubeId').equals(youtubeId).first()
}

export async function findDuplicateTracks(youtubeIds: string[]): Promise<TrackRecord[]> {
  const results = await Promise.all(youtubeIds.map((id) => findTrackByYoutubeId(id)))
  return results.filter((track): track is TrackRecord => Boolean(track))
}

export async function addTrack(track: TrackRecord): Promise<void> {
  await db.tracks.put(track)
}

export async function getTrack(id: string): Promise<TrackRecord | undefined> {
  return db.tracks.get(id)
}

export async function updateTrack(
  id: string,
  patch: Partial<TrackRecord>,
): Promise<void> {
  await db.tracks.update(id, patch)
}

export async function addDownloadHistory(entry: {
  id: string
  jobId: string
  trackId: string
  status: string
  completedAt: string
  error: string | null
}): Promise<void> {
  await db.downloadHistory.put(entry)
}

export async function getAllTracks(sortBy: 'date' | 'artist' | 'album' = 'date'): Promise<TrackRecord[]> {
  const tracks = await db.tracks.toArray()
  switch (sortBy) {
    case 'artist':
      return tracks.sort((a, b) => a.artist.localeCompare(b.artist))
    case 'album':
      return tracks.sort((a, b) => (a.album ?? '').localeCompare(b.album ?? ''))
    default:
      return tracks.sort(
        (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime(),
      )
  }
}

export async function searchTracks(query: string): Promise<TrackRecord[]> {
  const lower = query.toLowerCase()
  const tracks = await db.tracks.toArray()
  return tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(lower) ||
      track.artist.toLowerCase().includes(lower) ||
      (track.album?.toLowerCase().includes(lower) ?? false),
  )
}

export async function deleteTrack(id: string): Promise<void> {
  await db.tracks.delete(id)
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const record = await db.settings.get(key)
  return record?.value ?? fallback
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value })
}

export async function exportLibrary(): Promise<string> {
  const tracks = await db.tracks.toArray()
  const serializable = tracks.map((track) => ({
    ...track,
    thumbnailBlob: undefined,
    fileHandle: undefined,
    playbackKind: 'unavailable' as PlaybackKind,
    fileAvailable: false,
  }))
  return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), tracks: serializable }, null, 2)
}

export async function importLibrary(json: string): Promise<number> {
  const parsed = JSON.parse(json) as { tracks?: TrackRecord[] }
  const tracks = (parsed.tracks ?? []).map((track) => ({
    ...track,
    playbackKind: 'unavailable' as PlaybackKind,
    nativePath: track.nativePath ?? null,
    nativeUri: track.nativeUri ?? null,
    fileHandle: undefined,
    fileAvailable: false,
    thumbnailBlob: undefined,
  }))
  await db.tracks.bulkPut(tracks)
  return tracks.length
}
