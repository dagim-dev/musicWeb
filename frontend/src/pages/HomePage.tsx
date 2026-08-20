import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeUrl, type DownloadMode } from '@/api/client'
import { InstallBanner } from '@/components/download/InstallBanner'
import { DuplicateModal } from '@/components/library/DuplicateModal'
import { Card } from '@/components/ui/Card'
import { AnalyzeHero } from '@/features/analyze/AnalyzeHero'
import { DownloadOptions } from '@/features/analyze/DownloadOptions'
import { LinkInput } from '@/features/analyze/LinkInput'
import { TrackPicker } from '@/features/analyze/TrackPicker'
import { getAllTracks } from '@/db/libraryRepository'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import { useStartDownload } from '@/hooks/useStartDownload'
import { useToastStore } from '@/stores/toastStore'

export function HomePage() {
  const [url, setUrl] = useState('')
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof analyzeUrl>> | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<DownloadMode>('individual')
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [pendingDownload, setPendingDownload] = useState<{
    entryIds: string[]
    mode: DownloadMode
  } | null>(null)

  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.show)
  const { startDownload: startQueueDownload } = useStartDownload()

  const recentQuery = useQuery({
    queryKey: ['library', 'recent-art'],
    queryFn: () => getAllTracks('date'),
  })

  const mosaic = useMemo(() => {
    const urls = (recentQuery.data ?? [])
      .map((track) => track.thumbnailUrl)
      .filter((value): value is string => Boolean(value))
    return [...new Set(urls)].slice(0, 4)
  }, [recentQuery.data])

  const selectedEntries = useMemo(
    () => analysis?.entries.filter((entry) => selectedIds.has(entry.id)) ?? [],
    [analysis, selectedIds],
  )

  const duplicateQuery = useDuplicateCheck(selectedEntries, Boolean(analysis))
  const duplicates = duplicateQuery.data ?? []
  const heroArt = analysis?.entries.find((entry) => selectedIds.has(entry.id))?.thumbnail
    ?? analysis?.entries[0]?.thumbnail
    ?? mosaic[0]
    ?? null

  const analyzeMutation = useMutation({
    mutationFn: analyzeUrl,
    onSuccess: (result) => {
      setAnalysis(result)
      setSelectedIds(new Set(result.entries.map((entry) => entry.id)))
    },
    onError: (error: Error) => {
      showToast({ message: error.message, variant: 'error' })
    },
  })

  const startDownload = async (entryIds: string[], downloadMode: DownloadMode) => {
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
      showToast({ message: 'Download added to the queue. Keep DgLabs open until it finishes.', variant: 'success' })
      setAnalysis(null)
      setUrl('')
      void navigate('/queue')
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to start download',
        variant: 'error',
      })
    }
  }

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

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5 p-4 pb-8 lg:p-8">
      <AnalyzeHero
        title={analysis?.title ?? 'Download music'}
        subtitle={
          analysis
            ? analysis.album ?? `${analysis.entries.length} tracks ready to save`
            : 'Paste a YouTube link. Artwork leads, files follow.'
        }
        artworkSrc={heroArt}
        mosaic={mosaic}
        analyzing={analyzeMutation.isPending}
      />

      <InstallBanner />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="space-y-4">
          <LinkInput
            value={url}
            onChange={setUrl}
            onAnalyze={() => analyzeMutation.mutate(url.trim())}
            loading={analyzeMutation.isPending}
          />
          {analyzeMutation.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex animate-pulse items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-surface-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-surface-muted" />
                    <div className="h-3 w-1/2 rounded bg-surface-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {analysis ? (
            <TrackPicker
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
          ) : null}
        </Card>

        {analysis ? (
          <div className="lg:sticky lg:top-6 h-fit">
            <Card>
              <DownloadOptions
                mode={mode}
                selectedCount={selectedEntries.length}
                onModeChange={setMode}
                onDownload={handleDownloadRequest}
              />
            </Card>
          </div>
        ) : (
          <Card className="h-fit text-sm text-text-secondary">
            This is link analysis, not a catalog search. Paste a YouTube URL to inspect tracks, then
            send them to the download queue.
          </Card>
        )}
      </div>

      {showDuplicateModal ? (
        <DuplicateModal
          duplicates={duplicates}
          onContinue={() => {
            if (!pendingDownload) return
            setShowDuplicateModal(false)
            void startDownload(pendingDownload.entryIds, pendingDownload.mode)
            setPendingDownload(null)
          }}
          onCancel={() => {
            if (!pendingDownload) return
            const duplicateIds = new Set(duplicates.map((track) => track.youtubeId))
            const filtered = pendingDownload.entryIds.filter((id) => !duplicateIds.has(id))
            setShowDuplicateModal(false)
            if (filtered.length) void startDownload(filtered, pendingDownload.mode)
            setPendingDownload(null)
          }}
        />
      ) : null}
    </div>
  )
}
