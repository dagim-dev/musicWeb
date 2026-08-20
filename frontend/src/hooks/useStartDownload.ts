import { useCallback } from 'react'
import { createJob, type DownloadMode, type TrackEntry } from '@/api/client'
import { useDownloadQueueStore, type QueueJob } from '@/stores/downloadQueueStore'

export function useStartDownload() {
  const addJob = useDownloadQueueStore((s) => s.addJob)

  const startDownload = useCallback(
    async (params: {
      url: string
      title: string
      album: string | null
      entries: TrackEntry[]
      mode: DownloadMode
    }) => {
      const { url, title, album, entries, mode } = params
      if (!entries.length) return null

      const entryIds = entries.map((entry) => entry.id)
      const { job_id } = await createJob(url.trim(), entryIds, mode)

      const job: QueueJob = {
        id: job_id,
        url: url.trim(),
        title,
        album,
        mode,
        status: 'running',
        zipUrl: null,
        createdAt: new Date().toISOString(),
        tracks: entries.map((entry) => ({
          entry,
          stage: 'queued',
          percent: 0,
          message: 'Waiting…',
          fileName: null,
          error: null,
          saveStatus: 'idle',
          saveError: null,
        })),
      }

      addJob(job)
      return job
    },
    [addJob],
  )

  return { startDownload }
}
