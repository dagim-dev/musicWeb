import type { TrackRecord } from '@/db/schema'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'

interface DuplicateModalProps {
  duplicates: TrackRecord[]
  onContinue: () => void
  onCancel: () => void
}

export function DuplicateModal({ duplicates, onContinue, onCancel }: DuplicateModalProps) {
  return (
    <Sheet
      open
      onClose={onCancel}
      title="Already in your library"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            Skip duplicates
          </Button>
          <Button fullWidth onClick={onContinue}>
            Download anyway
          </Button>
        </div>
      }
    >
      <p className="text-sm text-text-secondary">
        {duplicates.length} track{duplicates.length === 1 ? '' : 's'} in this selection already exist
        locally. Skip them, or download again if you want a fresh copy.
      </p>
      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
        {duplicates.map((track) => (
          <li key={track.id} className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
            {track.artist} — {track.title}
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
