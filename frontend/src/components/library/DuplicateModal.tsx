import type { TrackRecord } from '@/db/schema'
import { Button } from '@/components/ui/Button'

interface DuplicateModalProps {
  duplicates: TrackRecord[]
  onContinue: () => void
  onCancel: () => void
}

export function DuplicateModal({ duplicates, onContinue, onCancel }: DuplicateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="animate-fade-in-up w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xl sm:scale-100">
        <h2 className="text-lg font-semibold text-text-primary">Already downloaded</h2>
        <p className="mt-2 text-sm text-text-secondary">
          {duplicates.length} track{duplicates.length === 1 ? '' : 's'} in your selection already
          exist in your library.
        </p>
        <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto overflow-x-hidden">
          {duplicates.map((track) => (
            <li key={track.id} className="truncate rounded-lg bg-surface-muted px-3 py-2 text-sm">
              {track.artist} — {track.title}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex min-w-0 flex-col gap-2 sm:flex-row">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            Skip duplicates
          </Button>
          <Button fullWidth onClick={onContinue}>
            Download anyway
          </Button>
        </div>
      </div>
    </div>
  )
}
