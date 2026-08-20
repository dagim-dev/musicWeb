import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { IconButton } from '@/components/ui/IconButton'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'default' | 'full'
}

export function Sheet({ open, onClose, title, children, footer, size = 'default' }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className={
              size === 'full'
                ? 'flex h-dvh w-full flex-col bg-canvas md:h-auto md:max-h-[90dvh] md:max-w-lg md:rounded-3xl md:border md:border-border'
                : 'flex max-h-[90dvh] w-full flex-col rounded-t-3xl border border-border bg-surface-elevated md:max-w-lg md:rounded-3xl'
            }
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex min-w-0 items-center justify-between gap-3 px-5 py-4">
              <h2 id="sheet-title" className="min-w-0 truncate text-lg font-bold text-text-primary">
                {title}
              </h2>
              <IconButton label="Close" onClick={onClose}>
                <X className="h-5 w-5" />
              </IconButton>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
            {footer ? <div className="border-t border-border px-5 py-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
