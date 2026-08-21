import { useCallback, useMemo } from 'react'
import { cancelJob } from '@/api/client'
import { QueueItem } from '@/components/download/QueueItem'
import { QueuedTrackRow } from '@/components/queue/QueuedTrackRow'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useFileSave } from '@/hooks/useFileSave'
import { useStartDownload } from '@/hooks/useStartDownload'
import { useDownloadQueueStore, type QueueJob } from '@/stores/downloadQueueStore'

export function QueuePage() {
  const jobs = useDownloadQueueStore((s) => s.jobs)
  const updateJob = useDownloadQueueStore((s) => s.updateJob)
  const removeJob = useDownloadQueueStore((s) => s.removeJob)
  const reorderJob = useDownloadQueueStore((s) => s.reorderJob)
  const setActiveTab = useDownloadQueueStore((s) => s.setActiveTab)
  const { saveZipFile } = useFileSave()
  const { startDownload: startQueueDownload } = useStartDownload()

  const stats = useMemo(() => {
    const trackCount = jobs.reduce((sum, job) => sum + job.tracks.length, 0)
    const runningCount = jobs.filter((job) => job.status === 'running').length
    return { jobCount: jobs.length, trackCount, runningCount }
  }, [jobs])

  const retryFailedTracks = useCallback(
    async (job: QueueJob) => {
      const failedEntries = job.tracks
        .filter((track) => track.stage === 'error')
        .map((track) => track.entry)

      if (!failedEntries.length) return

      await startQueueDownload({
        url: job.url,
        title: job.title,
        album: job.album,
        entries: failedEntries,
        mode: job.mode,
        switchToQueue: true,
      })
    },
    [startQueueDownload],
  )

  const getActiveTrackIndex = (job: QueueJob) =>
    job.tracks.findIndex((track) => !['done', 'error', 'cancelled'].includes(track.stage))

  return (
    <div className="min-w-0 space-y-5 pb-6 pt-4">
      <header className="animate-fade-in-up">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full gradient-accent" aria-hidden />
          DgLabs
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight gradient-text sm:text-4xl">
          Queue
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {jobs.length
            ? `${stats.trackCount} track${stats.trackCount === 1 ? '' : 's'} across ${stats.jobCount} job${stats.jobCount === 1 ? '' : 's'}${stats.runningCount ? ` · ${stats.runningCount} running` : ''}`
            : 'Tracks you add will appear here with live download progress.'}
        </p>
      </header>

      {jobs.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 text-text-secondary/60">
              <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Nothing in the queue</p>
            <p className="mt-1 text-xs text-text-secondary">
              Analyze a link and tap Add to Queue to get started.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setActiveTab('home')}>
            Go to Download
          </Button>
        </Card>
      ) : (
        <div className="min-w-0 space-y-4">
          {jobs.map((job, index) => {
            const activeTrackIndex = getActiveTrackIndex(job)

            return (
              <div key={job.id} className="min-w-0 space-y-3">
                <QueueItem
                  job={job}
                  hideActiveTrack
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
                <div className="min-w-0 space-y-2 pl-1">
                  {job.tracks.map((track, trackIndex) => (
                    <QueuedTrackRow
                      key={`${job.id}-${track.entry.id}`}
                      track={track}
                      trackNumber={trackIndex + 1}
                      totalTracks={job.tracks.length}
                      isActive={trackIndex === activeTrackIndex}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
