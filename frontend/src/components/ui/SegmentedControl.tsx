import clsx from 'clsx'
import type { ReactNode } from 'react'

interface Option<T extends string> {
  value: T
  label: ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: Array<Option<T>>
  onChange: (value: T) => void
  label?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid min-w-0 gap-1 rounded-xl bg-surface-muted p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={clsx(
              'min-h-12 min-w-0 rounded-lg px-2 py-2 text-center text-xs leading-tight font-semibold whitespace-normal transition duration-200 sm:px-3 sm:text-sm',
              selected
                ? 'bg-accent text-accent-foreground'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
