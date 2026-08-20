import { ClipboardPaste } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'

interface LinkInputProps {
  value: string
  onChange: (value: string) => void
  onAnalyze: () => void
  loading?: boolean
}

export function LinkInput({ value, onChange, onAnalyze, loading }: LinkInputProps) {
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) onChange(text.trim())
    } catch {
      // Clipboard permission denied
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (value.trim() && !loading) onAnalyze()
      }}
    >
      <label className="block text-sm font-medium text-text-secondary" htmlFor="youtube-url">
        YouTube link
      </label>
      <div className="flex min-w-0 gap-2">
        <input
          id="youtube-url"
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste a video, playlist, or album URL"
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-text-primary outline-none ring-accent focus:ring-2"
        />
        <IconButton label="Paste from clipboard" variant="filled" onClick={() => void pasteFromClipboard()}>
          <ClipboardPaste className="h-5 w-5" />
        </IconButton>
      </div>
      <Button fullWidth type="submit" disabled={!value.trim() || loading}>
        {loading ? 'Analyzing link…' : 'Analyze link'}
      </Button>
    </form>
  )
}
