import clsx from 'clsx'
import type { TrackEntry } from '@/api/client'
import { Artwork } from '@/components/ui/Artwork'

interface TrackSelectListProps {
  entries: TrackEntry[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (selected: boolean) => void
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function TrackSelectList({
  entries,
  selectedIds,
  onToggle,
  onToggleAll,
}: TrackSelectListProps) {
  const allSelected = entries.every((entry) => selectedIds.has(entry.id))

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-text-primary">{entries.length} tracks found</p>
        <button
          type="button"
          onClick={() => onToggleAll(!allSelected)}
          className="shrink-0 text-xs font-medium text-accent transition hover:text-accent-hover"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
        {entries.map((entry) => {
          const selected = selectedIds.has(entry.id)
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onToggle(entry.id)}
              className={clsx(
                'flex w-full min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200',
                selected
                  ? 'border-accent/50 bg-accent/10 ring-1 ring-accent/30'
                  : 'border-border bg-surface-muted hover:border-accent/20',
              )}
            >
              <Artwork src={entry.thumbnail} alt="" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{entry.title}</p>
                <p className="truncate text-xs text-text-secondary">
                  {entry.artist} · {formatDuration(entry.duration)}
                </p>
              </div>
              <div
                className={clsx(
                  'h-5 w-5 shrink-0 rounded-full border-2 transition-all duration-200',
                  selected ? 'border-accent bg-accent scale-110' : 'border-border',
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
