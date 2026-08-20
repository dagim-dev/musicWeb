import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/components/layout/navItems'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'

export function BottomNav() {
  const runningCount = useDownloadQueueStore(
    (s) => s.jobs.filter((job) => job.status === 'running' || job.status === 'pending').length,
  )

  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-canvas/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'touch-target relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition duration-200',
                isActive ? 'text-accent' : 'text-text-secondary',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
            {item.to === '/queue' && runningCount > 0 ? (
              <span className="absolute top-1 right-1/4 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
                {runningCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
