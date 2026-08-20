import Dexie, { type EntityTable } from 'dexie'

export type PlaybackKind = 'native' | 'file-handle' | 'session' | 'unavailable'

export interface TrackRecord {
  id: string
  youtubeId: string
  title: string
  artist: string
  album: string | null
  trackNumber: number | null
  duration: number | null
  thumbnailUrl: string | null
  thumbnailBlob?: Blob | null
  fileName: string
  fileSize: number | null
  downloadedAt: string
  sourceUrl: string
  playbackKind: PlaybackKind
  nativePath: string | null
  nativeUri: string | null
  fileHandle?: FileSystemFileHandle | null
  fileAvailable: boolean
}

export interface DownloadHistoryRecord {
  id: string
  jobId: string
  trackId: string
  status: string
  completedAt: string
  error: string | null
}

export interface SettingRecord {
  key: string
  value: string
}

export class MusicLibraryDB extends Dexie {
  tracks!: EntityTable<TrackRecord, 'id'>
  downloadHistory!: EntityTable<DownloadHistoryRecord, 'id'>
  settings!: EntityTable<SettingRecord, 'key'>

  constructor() {
    super('MusicLibraryDB')
    this.version(1).stores({
      tracks: 'id, youtubeId, artist, album, title, downloadedAt',
      downloadHistory: 'id, jobId, trackId, completedAt',
      settings: 'key',
    })
    this.version(2)
      .stores({
        tracks: 'id, youtubeId, artist, album, title, downloadedAt, playbackKind',
        downloadHistory: 'id, jobId, trackId, completedAt',
        settings: 'key',
      })
      .upgrade(async (tx) => {
        await tx
          .table('tracks')
          .toCollection()
          .modify((track: TrackRecord) => {
            track.playbackKind = track.playbackKind ?? 'unavailable'
            track.nativePath = track.nativePath ?? null
            track.nativeUri = track.nativeUri ?? null
            track.fileAvailable = track.fileAvailable ?? false
          })
      })
  }
}

export const db = new MusicLibraryDB()
