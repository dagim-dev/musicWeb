import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-surface-muted text-text-primary hover:bg-border',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-muted',
  danger: 'bg-danger/20 text-danger hover:bg-danger/30',
}

export function Button({
  variant = 'primary',
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'touch-target inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
