import Dexie, { type EntityTable } from 'dexie'

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
  }
}

export const db = new MusicLibraryDB()
