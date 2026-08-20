import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'plain' | 'filled' | 'accent'
  children: ReactNode
}

const sizes = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
}

const variants = {
  plain: 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
  filled: 'bg-surface-muted text-text-primary hover:bg-border',
  accent: 'bg-accent text-accent-foreground hover:bg-accent-hover',
}

export function IconButton({
  label,
  size = 'md',
  variant = 'plain',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={clsx(
        'inline-flex items-center justify-center rounded-full transition duration-200 ease-out active:scale-95 disabled:opacity-40',
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
