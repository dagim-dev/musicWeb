import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { QueueJobCard } from '@/features/queue/QueueJobCard'
import { useFileSave } from '@/hooks/useFileSave'
import { useStartDownload } from '@/hooks/useStartDownload'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'
import { useToastStore } from '@/stores/toastStore'

export function QueuePage() {
  const jobs = useDownloadQueueStore((s) => s.jobs)
  const connected = useDownloadQueueStore((s) => s.connected)
  const updateJob = useDownloadQueueStore((s) => s.updateJob)
  const removeJob = useDownloadQueueStore((s) => s.removeJob)
  const reorderJob = useDownloadQueueStore((s) => s.reorderJob)
  const { startDownload } = useStartDownload()
  const { saveZipFile } = useFileSave()
  const showToast = useToastStore((s) => s.show)
  const navigate = useNavigate()

  const featured = jobs.find((job) => job.status === 'running' || job.status === 'pending') ?? jobs[0]
  const rest = jobs.filter((job) => job.id !== featured?.id)
  const hasActive = jobs.some((job) => job.status === 'running' || job.status === 'pending')

  const retryFailed = async (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId)
    if (!job) return
    const failedEntries = job.tracks
      .filter((track) => track.stage === 'error' || track.saveStatus === 'error')
      .map((track) => track.entry)
    if (!failedEntries.length) return
    try {
      await startDownload({
        url: job.url,
        title: job.title,
        album: job.album,
        entries: failedEntries,
        mode: job.mode,
      })
      showToast({ message: 'Retrying failed tracks…', variant: 'info' })
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to retry',
        variant: 'error',
      })
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-5 p-4 pb-8 lg:p-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Queue</p>
        <h1 className="mt-1 text-3xl font-extrabold text-text-primary">Downloads</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Keep DgLabs open until files finish saving. Progress is stage-based: fetching, converting,
          tagging, then writing to this device.
        </p>
      </header>

      {!connected && hasActive ? (
        <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text-primary">
          Reconnecting to the download server. Progress will catch up automatically.
        </p>
      ) : null}

      {!jobs.length ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold text-text-primary">Nothing in the queue</p>
          <p className="mt-1 text-sm text-text-secondary">Analyze a YouTube link to start a download.</p>
          <Button className="mt-4" onClick={() => void navigate('/')}>
            Go to Home
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {featured ? (
            <QueueJobCard
              job={featured}
              featured
              isFirst
              isLast={rest.length === 0}
              onCancel={() => updateJob(featured.id, { status: 'cancelled' })}
              onRetryFailed={() => void retryFailed(featured.id)}
              onRetryZip={() => void saveZipFile(featured.id)}
              onReorder={(direction) => reorderJob(featured.id, direction)}
              onDismiss={() => removeJob(featured.id)}
            />
          ) : null}
          {rest.map((job, index) => (
            <QueueJobCard
              key={job.id}
              job={job}
              isFirst={false}
              isLast={index === rest.length - 1}
              onCancel={() => updateJob(job.id, { status: 'cancelled' })}
              onRetryFailed={() => void retryFailed(job.id)}
              onRetryZip={() => void saveZipFile(job.id)}
              onReorder={(direction) => reorderJob(job.id, direction)}
              onDismiss={() => removeJob(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
