import { Button } from '@/components/ui/Button'
import { usePwaInstall } from '@/hooks/usePwaInstall'

export function InstallBanner() {
  const { canInstall, install, dismiss } = usePwaInstall()

  if (!canInstall) return null

  return (
    <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 p-4">
      <p className="text-sm font-semibold text-text-primary">Install DgLabs</p>
      <p className="mt-1 text-xs text-text-secondary">
        Add to your home screen for a full-screen app experience without the browser bar.
      </p>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => void install()} className="flex-1">
          Install App
        </Button>
        <Button variant="ghost" onClick={dismiss}>
          Later
        </Button>
      </div>
    </div>
  )
}
