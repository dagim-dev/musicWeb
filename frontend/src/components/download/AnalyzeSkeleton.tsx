import { Card } from '@/components/ui/Card'

export function AnalyzeSkeleton() {
  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <div className="animate-shimmer h-4 w-3/4 rounded-lg" />
        <div className="animate-shimmer h-3 w-1/2 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="animate-shimmer h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="animate-shimmer h-3 w-full rounded" />
              <div className="animate-shimmer h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
