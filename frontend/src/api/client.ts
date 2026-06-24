import { API_BASE } from './config'
import { getSetting } from '@/db/libraryRepository'

export interface TrackEntry {
  id: string
  title: string
  artist: string
  duration: number | null
  thumbnail: string | null
  track_number: number | null
}

export interface AnalyzeResponse {
  type: 'video' | 'playlist'
  title: string
  album: string | null
  entries: TrackEntry[]
}

export type DownloadMode = 'individual' | 'zip'

export type JobStage =
  | 'queued'
  | 'downloading'
  | 'converting'
  | 'tagging'
  | 'delivering'
  | 'done'
  | 'error'
  | 'cancelled'

export interface TrackStatus {
  index: number
  entry_id: string
  title: string
  artist: string
  stage: JobStage
  percent: number
  message: string
  file_name: string | null
  error: string | null
}

export interface JobSnapshot {
  job_id: string
  status: 'pending' | 'running' | 'complete' | 'error' | 'cancelled'
  mode: DownloadMode
  total_tracks: number
  completed_tracks: number
  tracks: TrackStatus[]
  zip_ready: boolean
}

async function apiHeaders(extra?: HeadersInit): Promise<HeadersInit> {
  const cookies = (await getSetting('youtubeCookiesBase64', '')).trim()
  return {
    'Content-Type': 'application/json',
    ...(cookies ? { 'X-YouTube-Cookies-Base64': cookies } : {}),
    ...(extra ?? {}),
  }
}

function formatApiError(detail: unknown, status: number): string {
  const message = typeof detail === 'string' ? detail : `Request failed (${status})`
  if (message.toLowerCase().includes('not a bot') || message.toLowerCase().includes('sign in to confirm')) {
    return 'YouTube blocked this download. Settings → YouTube Session → upload cookies.txt (see extension steps).'
  }
  return message
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: await apiHeaders(init?.headers),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(formatApiError(body.detail, response.status))
  }

  return response.json() as Promise<T>
}

export function analyzeUrl(url: string) {
  return request<AnalyzeResponse>('/api/v1/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

export function createJob(url: string, entryIds: string[] | null, mode: DownloadMode) {
  return request<{ job_id: string }>('/api/v1/jobs', {
    method: 'POST',
    body: JSON.stringify({ url, entry_ids: entryIds, mode }),
  })
}

export function getJob(jobId: string) {
  return request<JobSnapshot>(`/api/v1/jobs/${jobId}`)
}

export function cancelJob(jobId: string) {
  return request<{ status: string }>(`/api/v1/jobs/${jobId}`, { method: 'DELETE' })
}

export function trackFileUrl(jobId: string, index: number) {
  return `${API_BASE}/api/v1/jobs/${jobId}/tracks/${index}/file`
}

export function zipFileUrl(jobId: string) {
  return `${API_BASE}/api/v1/jobs/${jobId}/zip`
}

export function healthCheck() {
  return request<{
    status: string
    ffmpeg: string | null
    ytdlp_version: string
    youtube_cookies: boolean
  }>('/api/v1/health')
}
