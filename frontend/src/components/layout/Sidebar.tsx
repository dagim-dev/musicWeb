import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/components/layout/navItems'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'

export function Sidebar() {
  const runningCount = useDownloadQueueStore(
    (s) => s.jobs.filter((job) => job.status === 'running' || job.status === 'pending').length,
  )

  const primary = NAV_ITEMS.filter((item) => item.to !== '/settings')
  const settings = NAV_ITEMS.find((item) => item.to === '/settings')

  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-6 md:flex">
      <p className="px-3 text-xs font-semibold tracking-[0.22em] text-accent uppercase">DgLabs</p>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {primary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition duration-200',
                isActive
                  ? 'bg-surface-muted text-text-primary'
                  : 'text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1">{item.label}</span>
            {item.to === '/queue' && runningCount > 0 ? (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                {runningCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
      {settings ? (
        <NavLink
          to={settings.to}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition duration-200',
              isActive
                ? 'bg-surface-muted text-text-primary'
                : 'text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary',
            )
          }
        >
          <settings.icon className="h-5 w-5" />
          {settings.label}
        </NavLink>
      ) : null}
    </aside>
  )
}
