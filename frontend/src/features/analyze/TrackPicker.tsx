import clsx from 'clsx'
import type { TrackEntry } from '@/api/client'
import { Artwork } from '@/components/ui/Artwork'
import { formatDuration } from '@/utils/format'

interface TrackPickerProps {
  entries: TrackEntry[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (selected: boolean) => void
}

export function TrackPicker({ entries, selectedIds, onToggle, onToggleAll }: TrackPickerProps) {
  const allSelected = entries.every((entry) => selectedIds.has(entry.id))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">{entries.length} tracks found</p>
        <button
          type="button"
          onClick={() => onToggleAll(!allSelected)}
          className="text-xs font-semibold text-accent"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {entries.map((entry) => {
          const selected = selectedIds.has(entry.id)
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onToggle(entry.id)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition duration-200',
                selected
                  ? 'border-accent/50 bg-accent/10'
                  : 'border-border bg-surface-muted hover:border-text-secondary/30',
              )}
            >
              <Artwork src={entry.thumbnail} className="h-12 w-12 shrink-0 rounded-lg" />
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
