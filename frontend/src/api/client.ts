import { API_BASE } from './config'

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

function apiHeaders(extra?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(extra ?? {}),
  }
}

function formatApiError(detail: unknown, status: number): string {
  return typeof detail === 'string' ? detail : `Request failed (${status})`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: apiHeaders(init?.headers),
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
