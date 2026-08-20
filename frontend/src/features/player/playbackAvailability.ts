import type { TrackRecord } from '@/db/schema'
import { getSessionBlob } from '@/features/player/sessionBlobs'

export function isPlaybackAvailable(track: TrackRecord): boolean {
  if (track.playbackKind === 'session') return Boolean(getSessionBlob(track.id))
  return track.fileAvailable
}
