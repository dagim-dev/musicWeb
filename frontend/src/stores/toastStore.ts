import { create } from 'zustand'

export type ToastVariant = 'info' | 'success' | 'error'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastState {
  message: string
  variant: ToastVariant
  action?: ToastAction
  visible: boolean
  show: (toast: { message: string; variant?: ToastVariant; action?: ToastAction }) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  variant: 'info',
  action: undefined,
  visible: false,
  show: ({ message, variant = 'info', action }) =>
    set({ message, variant, action, visible: true }),
  hide: () => set({ visible: false, action: undefined }),
}))
