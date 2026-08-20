import clsx from 'clsx'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastProps {
  message: string
  visible: boolean
  onClose: () => void
  variant?: 'info' | 'success' | 'error'
  action?: ToastAction
}

export function Toast({ message, visible, onClose, variant = 'info', action }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, action ? 8000 : 4000)
    return () => clearTimeout(timer)
  }, [visible, onClose, action])

  if (!visible) return null

  return (
    <div
      className={clsx(
        'fixed inset-x-4 z-40 rounded-xl border px-4 py-3 text-sm font-medium md:inset-x-auto md:right-6 md:left-auto md:w-96',
        'bottom-[calc(var(--dock-offset,6.5rem)+0.75rem)]',
        variant === 'success' && 'border-success/30 bg-surface-elevated text-success',
        variant === 'error' && 'border-danger/30 bg-surface-elevated text-danger',
        variant === 'info' && 'border-border bg-surface-elevated text-text-primary',
      )}
      role="status"
    >
      <p>{message}</p>
      {action ? (
        <Button
          variant="secondary"
          fullWidth
          className="mt-2"
          onClick={() => {
            action.onClick()
            onClose()
          }}
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
