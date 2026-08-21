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
        'fixed inset-x-4 bottom-24 z-50 max-w-full animate-fade-in-up rounded-xl border-l-4 px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-md sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2',
        variant === 'success' && 'border-l-success border-success/20 bg-success/15 text-success',
        variant === 'error' && 'border-l-danger border-danger/20 bg-danger/15 text-danger',
        variant === 'info' && 'border-l-accent border-border/50 bg-surface-elevated/95 text-text-primary',
      )}
    >
      <p>{message}</p>
      {action ? (
        <Button
          variant="secondary"
          fullWidth
          className="mt-2 !bg-surface-elevated !text-text-primary"
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
