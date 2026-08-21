import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'default' | 'compact'
  fullWidth?: boolean
}

const variants = {
  primary:
    'gradient-accent text-accent-foreground shadow-lg shadow-accent/25 hover:opacity-95 hover:glow-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
  secondary:
    'bg-surface-muted text-text-primary hover:bg-border focus-visible:ring-2 focus-visible:ring-accent/50',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary',
  danger: 'bg-danger/20 text-danger hover:bg-danger/30',
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
        size === 'default' ? 'touch-target px-4 py-3 text-sm' : 'min-h-9 px-3 py-1.5 text-xs',
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
