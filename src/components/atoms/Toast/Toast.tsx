'use client'

import { useEffect } from 'react'
import { cn } from '@/src/lib/cn'

export interface ToastData {
  id: string
  message: string
  variant: 'success' | 'error' | 'warning'
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3000)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg min-w-[240px] max-w-[340px]',
        toast.variant === 'success' && 'bg-brand-green',
        toast.variant === 'error' && 'bg-destructive',
        toast.variant === 'warning' && 'bg-amber-500'
      )}
    >
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 opacity-80 hover:opacity-100">
        ✕
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
