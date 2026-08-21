import { Button } from '@/components/ui/Button'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  onAnalyze: () => void
  loading?: boolean
}

export function UrlInput({ value, onChange, onAnalyze, loading }: UrlInputProps) {
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) onChange(text.trim())
    } catch {
      // Clipboard permission denied
    }
  }

  return (
    <div className="min-w-0 space-y-3">
      <label className="block text-sm font-medium text-text-secondary">YouTube URL</label>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <input
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Paste video, playlist, or album link"
            className="w-full min-w-0 rounded-xl border border-border bg-surface-muted py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <Button variant="secondary" onClick={() => void pasteFromClipboard()} type="button" className="shrink-0">
          Paste
        </Button>
      </div>
      <Button fullWidth onClick={onAnalyze} disabled={!value.trim() || loading}>
        {loading ? 'Analyzing…' : 'Analyze'}
      </Button>
    </div>
  )
}
