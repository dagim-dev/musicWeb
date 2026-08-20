import { getJob, zipFileUrl, type JobStage } from '@/api/client'
import { type QueueJob, type QueueTrack } from '@/stores/downloadQueueStore'

export const STAGE_LABELS: Record<JobStage, string> = {
  queued: 'Queued',
  downloading: 'Fetching',
  converting: 'Converting',
  tagging: 'Tagging',
  delivering: 'Saving to device',
  done: 'Complete',
  error: 'Failed',
  cancelled: 'Cancelled',
}

export function displayTrackPercent(track: QueueTrack): number {
  if (track.stage === 'done' && track.saveStatus === 'saved') return 100
  if (track.stage === 'error' || track.stage === 'cancelled') return track.percent
  return Math.min(track.percent, 99)
}

export function trackStageLabel(track: QueueTrack): string {
  if (track.stage === 'done' && track.saveStatus !== 'saved') return 'Saving to device'
  if (track.saveStatus === 'error') return 'Save failed'
  return STAGE_LABELS[track.stage]
}

export function jobProgress(job: QueueJob): { completed: number; failed: number; percent: number } {
  const completed = job.tracks.filter((track) => track.stage === 'done' && track.saveStatus === 'saved').length
  const failed = job.tracks.filter((track) => track.stage === 'error' || track.saveStatus === 'error').length
  const percents = job.tracks.map(displayTrackPercent)
  const percent = percents.length
    ? Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length)
    : 0
  return { completed, failed, percent }
}

export function activeTrack(job: QueueJob): { track: QueueTrack; index: number } | null {
  const index = job.tracks.findIndex(
    (track) => !['done', 'error', 'cancelled'].includes(track.stage) || track.saveStatus === 'saving',
  )
  if (index < 0) return null
  const track = job.tracks[index]
  return track ? { track, index } : null
}

export function applyJobSnapshot(job: QueueJob, snapshot: Awaited<ReturnType<typeof getJob>>): Partial<QueueJob> {
  return {
    status: snapshot.status,
    zipUrl: snapshot.zip_ready ? zipFileUrl(job.id) : job.zipUrl,
    tracks: job.tracks.map((track, index) => {
      const remote = snapshot.tracks[index]
      if (!remote) return track
      return {
        ...track,
        stage: remote.stage,
        percent:
          remote.stage === 'done' && track.saveStatus !== 'saved'
            ? Math.min(remote.percent, 99)
            : remote.percent,
        message: remote.message,
        fileName: remote.file_name,
        error: remote.error,
        resolvedArtist: remote.artist,
        resolvedTitle: remote.title,
      }
    }),
  }
}

