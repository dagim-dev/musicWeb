import { useEffect, useRef, useState } from 'react'
import { getJob } from '@/api/client'
import { Toast } from '@/components/ui/Toast'
import { useDownloadSocket } from '@/hooks/useDownloadSocket'
import { useFileSave } from '@/hooks/useFileSave'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'
import { getSaveLocationMessage } from '@/utils/nativeFileSave'
import { openSamsungMusic } from '@/utils/samsungMusic'

export function QueueEffects() {
  const jobs = useDownloadQueueStore((s) => s.jobs)
  const updateJob = useDownloadQueueStore((s) => s.updateJob)
  const { saveTrackFile, saveZipFile } = useFileSave()
  const savedTracksRef = useRef<Set<string>>(new Set())
  const savedZipsRef = useRef<Set<string>>(new Set())
  const [toast, setToast] = useState<{
    message: string
    variant: 'info' | 'success' | 'error'
    action?: { label: string; onClick: () => void }
  } | null>(null)

  const activeJobId = jobs.find((job) => job.status === 'running')?.id ?? jobs[0]?.id ?? null
  useDownloadSocket(activeJobId)

  useEffect(() => {
    const runningJobs = jobs.filter((job) => job.status === 'running')
    if (!runningJobs.length) return

    const interval = setInterval(() => {
      runningJobs.forEach((job) => {
        void getJob(job.id)
          .then((snapshot) => {
            updateJob(job.id, {
              status: snapshot.status,
              tracks: job.tracks.map((track, index) => {
                const remote = snapshot.tracks[index]
                if (!remote) return track
                return {
                  ...track,
                  stage: remote.stage,
                  percent: remote.percent,
                  message: remote.message,
                  fileName: remote.file_name,
                  error: remote.error,
                  resolvedArtist: remote.artist,
                  resolvedTitle: remote.title,
                }
              }),
            })
          })
          .catch(() => undefined)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [jobs, updateJob])

  useEffect(() => {
    jobs.forEach((job) => {
      job.tracks.forEach((track, index) => {
        const saveKey = `${job.id}:${index}`
        if (track.stage === 'done' && track.fileName && !savedTracksRef.current.has(saveKey)) {
          savedTracksRef.current.add(saveKey)
          void saveTrackFile({
            jobId: job.id,
            index,
            youtubeId: track.entry.id,
            title: track.resolvedTitle ?? track.entry.title,
            artist: track.resolvedArtist ?? track.entry.artist,
            album: job.album,
            trackNumber: track.entry.track_number,
            duration: track.entry.duration,
            thumbnailUrl: track.entry.thumbnail,
            sourceUrl: job.url,
            fileName: track.fileName,
          }).then(() => {
            setToast({
              message: getSaveLocationMessage(),
              variant: 'success',
              action: { label: 'Open Samsung Music', onClick: openSamsungMusic },
            })
          })
        }
      })

      if (
        job.status === 'complete' &&
        job.mode === 'zip' &&
        job.zipUrl &&
        !savedZipsRef.current.has(job.id)
      ) {
        savedZipsRef.current.add(job.id)
        void saveZipFile(job.id)
      }
    })
  }, [jobs, saveTrackFile, saveZipFile])

  return (
    <Toast
      message={toast?.message ?? ''}
      visible={Boolean(toast)}
      variant={toast?.variant ?? 'info'}
      action={toast?.action}
      onClose={() => setToast(null)}
    />
  )
}
