import clsx from 'clsx'
import type { TrackEntry } from '@/api/client'

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">{entries.length} tracks found</p>
        <button
          type="button"
          onClick={() => onToggleAll(!allSelected)}
          className="text-xs font-medium text-accent"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {entries.map((entry) => {
          const selected = selectedIds.has(entry.id)
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onToggle(entry.id)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                selected
                  ? 'border-accent/50 bg-accent/10'
                  : 'border-border bg-surface-muted hover:border-border/80',
              )}
            >
              {entry.thumbnail ? (
                <img
                  src={entry.thumbnail}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-surface" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{entry.title}</p>
                <p className="truncate text-xs text-text-secondary">
                  {entry.artist} · {formatDuration(entry.duration)}
                </p>
              </div>
              <div
                className={clsx(
                  'h-5 w-5 rounded-full border-2',
                  selected ? 'border-accent bg-accent' : 'border-border',
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
