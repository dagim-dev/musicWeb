import type { DownloadMode } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

interface DownloadOptionsProps {
  mode: DownloadMode
  selectedCount: number
  onModeChange: (mode: DownloadMode) => void
  onDownload: () => void
}

export function DownloadOptions({
  mode,
  selectedCount,
  onModeChange,
  onDownload,
}: DownloadOptionsProps) {
  return (
    <div className="space-y-3">
      <SegmentedControl
        label="Download format"
        value={mode}
        onChange={onModeChange}
        options={[
          {
            value: 'individual',
            label: (
              <>
                <span className="sm:hidden">Files</span>
                <span className="hidden sm:inline">Individual files</span>
              </>
            ),
          },
          {
            value: 'zip',
            label: (
              <>
                <span className="sm:hidden">ZIP</span>
                <span className="hidden sm:inline">ZIP package</span>
              </>
            ),
          },
        ]}
      />
      <Button fullWidth onClick={onDownload} disabled={!selectedCount}>
        Download {selectedCount} {selectedCount === 1 ? 'track' : 'tracks'}
      </Button>
    </div>
  )
}
