import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface-elevated p-4 shadow-lg shadow-black/20',
        className,
      )}
      {...props}
    />
  )
}
