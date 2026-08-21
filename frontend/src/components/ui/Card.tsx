import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border/80 bg-surface-elevated/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm',
        interactive && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5',
        className,
      )}
      {...props}
    />
  )
}
