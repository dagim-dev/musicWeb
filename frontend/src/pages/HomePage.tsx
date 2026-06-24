import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  analyzeUrl,
  cancelJob,
  getJob,
  type AnalyzeResponse,
  type DownloadMode,
} from '@/api/client'
import { InstallBanner } from '@/components/download/InstallBanner'
import { AnalyzeSkeleton } from '@/components/download/AnalyzeSkeleton'
import { OnboardingCarousel } from '@/components/download/OnboardingCarousel'
import { QueueItem } from '@/components/download/QueueItem'
import { TrackSelectList } from '@/components/download/TrackSelectList'
import { UrlInput } from '@/components/download/UrlInput'
import { DuplicateModal } from '@/components/library/DuplicateModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Toast } from '@/components/ui/Toast'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import { useDownloadSocket } from '@/hooks/useDownloadSocket'
import { useFileSave } from '@/hooks/useFileSave'
import { useStartDownload } from '@/hooks/useStartDownload'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'
import { getSaveLocationMessage } from '@/utils/nativeFileSave'
import { openSamsungMusic } from '@/utils/samsungMusic'

export function HomePage() {
  const [url, setUrl] = useState('')
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<DownloadMode>('individual')
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [pendingDownload, setPendingDownload] = useState<{
    entryIds: string[]
    mode: DownloadMode
  } | null>(null)
  const [toast, setToast] = useState<{
    message: string
    variant: 'info' | 'success' | 'error'
    action?: { label: string; onClick: () => void }
  } | null>(null)

  const jobs = useDownloadQueueStore((s) => s.jobs)
  const updateJob = useDownloadQueueStore((s) => s.updateJob)
  const removeJob = useDownloadQueueStore((s) => s.removeJob)
  const reorderJob = useDownloadQueueStore((s) => s.reorderJob)
  const { saveTrackFile, saveZipFile } = useFileSave()
  const { startDownload: startQueueDownload } = useStartDownload()
  const savedTracksRef = useRef<Set<string>>(new Set())
  const savedZipsRef = useRef<Set<string>>(new Set())

  const activeJobId = jobs.find((job) => job.status === 'running')?.id ?? jobs[0]?.id ?? null
  useDownloadSocket(activeJobId)

  const selectedEntries = useMemo(
    () => analysis?.entries.filter((entry) => selectedIds.has(entry.id)) ?? [],
    [analysis, selectedIds],
  )

  const duplicateQuery = useDuplicateCheck(selectedEntries, Boolean(analysis))
  const duplicates = duplicateQuery.data ?? []

  const analyzeMutation = useMutation({
    mutationFn: analyzeUrl,
    onSuccess: (result) => {
      setAnalysis(result)
      setSelectedIds(new Set(result.entries.map((entry) => entry.id)))
    },
    onError: (error: Error) => {
      setToast({ message: error.message, variant: 'error' })
    },
  })

  const startDownload = useCallback(
    async (entryIds: string[], downloadMode: DownloadMode) => {
      if (!analysis || !url.trim()) return

      try {
        const entries = analysis.entries.filter((entry) => entryIds.includes(entry.id))
        await startQueueDownload({
          url: url.trim(),
          title: analysis.title,
          album: analysis.album,
          entries,
          mode: downloadMode,
        })

        setToast({
          message: 'Download started. Files will save to your Downloads folder.',
          variant: 'success',
        })
        setAnalysis(null)
        setUrl('')
      } catch (error) {
        setToast({
          message: error instanceof Error ? error.message : 'Failed to start download',
          variant: 'error',
        })
      }
    },
    [analysis, startQueueDownload, url],
  )

  const retryFailedTracks = useCallback(
    async (job: (typeof jobs)[number]) => {
      const failedEntries = job.tracks
        .filter((track) => track.stage === 'error')
        .map((track) => track.entry)

      if (!failedEntries.length) return

      try {
        await startQueueDownload({
          url: job.url,
          title: job.title,
          album: job.album,
          entries: failedEntries,
          mode: job.mode,
        })
        setToast({ message: 'Retrying failed tracks…', variant: 'info' })
      } catch (error) {
        setToast({
          message: error instanceof Error ? error.message : 'Failed to retry',
          variant: 'error',
        })
      }
    },
    [startQueueDownload],
  )

  const handleDownloadRequest = () => {
    if (!selectedEntries.length) return
    const entryIds = selectedEntries.map((entry) => entry.id)
    if (duplicates.length) {
      setPendingDownload({ entryIds, mode })
      setShowDuplicateModal(true)
      return
    }
    void startDownload(entryIds, mode)
  }

  const handleSkipDuplicates = () => {
    if (!pendingDownload) return
    const duplicateIds = new Set(duplicates.map((track) => track.youtubeId))
    const filtered = pendingDownload.entryIds.filter((id) => !duplicateIds.has(id))
    setShowDuplicateModal(false)
    if (filtered.length) void startDownload(filtered, pendingDownload.mode)
    setPendingDownload(null)
  }

  const handleContinueDuplicates = () => {
    if (!pendingDownload) return
    setShowDuplicateModal(false)
    void startDownload(pendingDownload.entryIds, pendingDownload.mode)
    setPendingDownload(null)
  }

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
    <div className="space-y-5 p-4 pb-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">DgLabs</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">Download Music</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Paste a YouTube link and save 320 kbps MP3 files to your device.
        </p>
      </header>

      <InstallBanner />
      <OnboardingCarousel />

      <Card>
        <UrlInput
          value={url}
          onChange={setUrl}
          onAnalyze={() => analyzeMutation.mutate(url.trim())}
          loading={analyzeMutation.isPending}
        />
      </Card>

      {analyzeMutation.isPending ? <AnalyzeSkeleton /> : null}

      {analysis ? (
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">{analysis.title}</p>
            {analysis.album ? (
              <p className="text-xs text-text-secondary">Album: {analysis.album}</p>
            ) : null}
          </div>

          <TrackSelectList
            entries={analysis.entries}
            selectedIds={selectedIds}
            onToggle={(id) => {
              setSelectedIds((current) => {
                const next = new Set(current)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
              })
            }}
            onToggleAll={(selected) => {
              setSelectedIds(
                selected ? new Set(analysis.entries.map((entry) => entry.id)) : new Set(),
              )
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === 'individual' ? 'primary' : 'secondary'}
              onClick={() => setMode('individual')}
            >
              Individual files
            </Button>
            <Button
              variant={mode === 'zip' ? 'primary' : 'secondary'}
              onClick={() => setMode('zip')}
            >
              ZIP package
            </Button>
          </div>

          <Button fullWidth onClick={handleDownloadRequest} disabled={!selectedEntries.length}>
            Add to Queue ({selectedEntries.length})
          </Button>
        </Card>
      ) : null}

      {jobs.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Active Queue
          </h2>
          {jobs.map((job, index) => (
            <QueueItem
              key={job.id}
              job={job}
              isFirst={index === 0}
              isLast={index === jobs.length - 1}
              onCancel={() => {
                void cancelJob(job.id).then(() => {
                  updateJob(job.id, { status: 'cancelled' })
                })
              }}
              onRetryZip={() => void saveZipFile(job.id)}
              onRetryFailed={() => void retryFailedTracks(job)}
              onReorder={(direction) => reorderJob(job.id, direction)}
              onDismiss={() => removeJob(job.id)}
            />
          ))}
        </section>
      ) : null}

      {showDuplicateModal ? (
        <DuplicateModal
          duplicates={duplicates}
          onContinue={handleContinueDuplicates}
          onCancel={handleSkipDuplicates}
        />
      ) : null}

      <Toast
        message={toast?.message ?? ''}
        visible={Boolean(toast)}
        variant={toast?.variant ?? 'info'}
        action={toast?.action}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
