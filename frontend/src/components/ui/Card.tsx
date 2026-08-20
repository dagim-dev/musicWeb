import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'min-w-0 max-w-full rounded-2xl border border-border bg-surface-elevated p-4',
        className,
      )}
      {...props}
    />
  )
}
