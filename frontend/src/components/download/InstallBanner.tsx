import { Button } from '@/components/ui/Button'
import { usePwaInstall } from '@/hooks/usePwaInstall'

export function InstallBanner() {
  const { canInstall, install, dismiss } = usePwaInstall()

  if (!canInstall) return null

  return (
    <div className="animate-fade-in-up mb-4 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 to-accent-secondary/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-accent text-accent-foreground">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">Install DgLabs</p>
          <p className="mt-1 text-xs text-text-secondary">
            Add to your home screen for a full-screen app experience without the browser bar.
          </p>
        </div>
      </div>
      <div className="mt-3 flex min-w-0 gap-2">
        <Button onClick={() => void install()} className="min-w-0 flex-1">
          Install App
        </Button>
        <Button variant="ghost" onClick={dismiss} className="shrink-0">
          Later
        </Button>
      </div>
    </div>
  )
}
