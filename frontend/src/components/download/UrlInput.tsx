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
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-secondary">YouTube URL</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste video, playlist, or album link"
          className="flex-1 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-text-primary outline-none ring-accent focus:ring-2"
        />
        <Button variant="secondary" onClick={() => void pasteFromClipboard()} type="button">
          Paste
        </Button>
      </div>
      <Button fullWidth onClick={onAnalyze} disabled={!value.trim() || loading}>
        {loading ? 'Analyzing…' : 'Analyze'}
      </Button>
    </div>
  )
}
