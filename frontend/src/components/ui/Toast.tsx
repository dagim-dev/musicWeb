import clsx from 'clsx'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onClose: () => void
  variant?: 'info' | 'success' | 'error'
}

export function Toast({ message, visible, onClose, variant = 'info' }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      className={clsx(
        'fixed inset-x-4 bottom-24 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl',
        variant === 'success' && 'border-success/30 bg-success/20 text-success',
        variant === 'error' && 'border-danger/30 bg-danger/20 text-danger',
        variant === 'info' && 'border-border bg-surface-elevated text-text-primary',
      )}
    >
      {message}
    </div>
  )
}
