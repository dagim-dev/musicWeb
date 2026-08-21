import clsx from 'clsx'

interface BottomNavProps {
  active: 'home' | 'settings'
  onChange: (tab: 'home' | 'settings') => void
}

const items = [
  { id: 'home' as const, label: 'Download', icon: '↓' },
  { id: 'settings' as const, label: 'Settings', icon: '⚙' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={clsx(
              'touch-target flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition',
              active === item.id ? 'text-accent' : 'text-text-secondary',
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
