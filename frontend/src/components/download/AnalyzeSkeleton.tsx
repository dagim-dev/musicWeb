import { Card } from '@/components/ui/Card'

export function AnalyzeSkeleton() {
  return (
    <Card className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-lg bg-surface-muted" />
        <div className="h-3 w-1/2 rounded-lg bg-surface-muted" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-surface-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full rounded bg-surface-muted" />
              <div className="h-3 w-2/3 rounded bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
