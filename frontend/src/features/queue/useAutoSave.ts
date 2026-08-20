import { useEffect, useRef } from 'react'
import { classifyError, SaveCancelledError } from '@/utils/errors'
import { getSaveLocationMessage } from '@/utils/nativeFileSave'
import { openSamsungMusic } from '@/utils/samsungMusic'
import { useFileSave } from '@/hooks/useFileSave'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'
import { useToastStore } from '@/stores/toastStore'
import { zipFileUrl } from '@/api/client'

export function useAutoSave() {
  const jobs = useDownloadQueueStore((s) => s.jobs)
  const updateTrack = useDownloadQueueStore((s) => s.updateTrack)
  const updateJob = useDownloadQueueStore((s) => s.updateJob)
  const { saveTrackFile, saveZipFile } = useFileSave()
  const showToast = useToastStore((s) => s.show)
  const savingKeys = useRef(new Set<string>())
  const savedZips = useRef(new Set<string>())

  useEffect(() => {
    jobs.forEach((job) => {
      job.tracks.forEach((track, index) => {
        const saveKey = `${job.id}:${index}`
        if (track.stage !== 'done' || track.saveStatus === 'saved' || track.saveStatus === 'saving') return
        if (savingKeys.current.has(saveKey)) return
        savingKeys.current.add(saveKey)
        updateTrack(job.id, index, { saveStatus: 'saving', message: 'Saving to device' })

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
          fileName: track.fileName ?? `${track.entry.title}.mp3`,
        })
          .then(() => {
            updateTrack(job.id, index, {
              saveStatus: 'saved',
              percent: 100,
              message: 'Complete',
              saveError: null,
            })
            showToast({
              message: getSaveLocationMessage(),
              variant: 'success',
              action: { label: 'Open Samsung Music', onClick: openSamsungMusic },
            })
          })
          .catch((error: unknown) => {
            savingKeys.current.delete(saveKey)
            const classified = classifyError(error)
            updateTrack(job.id, index, {
              saveStatus: 'error',
              saveError: classified.title,
              message: classified.title,
              error: classified.title,
            })
            if (!(error instanceof SaveCancelledError)) {
              showToast({ message: classified.title, variant: 'error' })
            }
          })
      })

      if (job.status === 'complete' && job.mode === 'zip' && !savedZips.current.has(job.id)) {
        savedZips.current.add(job.id)
        const zipUrl = job.zipUrl ?? zipFileUrl(job.id)
        updateJob(job.id, { zipUrl })
        void saveZipFile(job.id).catch((error: unknown) => {
          savedZips.current.delete(job.id)
          showToast({
            message: classifyError(error).title,
            variant: 'error',
          })
        })
      }
    })
  }, [jobs, saveTrackFile, saveZipFile, showToast, updateJob, updateTrack])
}
