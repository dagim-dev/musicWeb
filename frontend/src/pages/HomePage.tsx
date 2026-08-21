import { useMutation } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import {
  analyzeUrl,
  type AnalyzeResponse,
  type DownloadMode,
} from '@/api/client'
import { InstallBanner } from '@/components/download/InstallBanner'
import { AnalyzeSkeleton } from '@/components/download/AnalyzeSkeleton'
import { OnboardingCarousel } from '@/components/download/OnboardingCarousel'
import { TrackSelectList } from '@/components/download/TrackSelectList'
import { UrlInput } from '@/components/download/UrlInput'
import { DuplicateModal } from '@/components/library/DuplicateModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Toast } from '@/components/ui/Toast'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import { useStartDownload } from '@/hooks/useStartDownload'

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
  } | null>(null)

  const { startDownload: startQueueDownload } = useStartDownload()

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
          switchToQueue: true,
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

  return (
    <div className="min-w-0 space-y-5 pb-6 pt-4">
      <header className="animate-fade-in-up">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full gradient-accent" aria-hidden />
          DgLabs
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight gradient-text sm:text-4xl">
          Download Music
        </h1>
        <p className="mt-2 max-w-prose text-sm text-text-secondary">
          Paste a link and save 320 kbps MP3 files to your device.
        </p>
      </header>

      <InstallBanner />
      <OnboardingCarousel />

      <div className="min-w-0 space-y-5">
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
          <Card className="animate-fade-in-up space-y-4">
            <div>
              <p className="truncate text-sm font-semibold text-text-primary">{analysis.title}</p>
              {analysis.album ? (
                <p className="truncate text-xs text-text-secondary">Album: {analysis.album}</p>
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
      </div>

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
        onClose={() => setToast(null)}
      />
    </div>
  )
}
