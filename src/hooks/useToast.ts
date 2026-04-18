'use client'

import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ToastData } from '@/src/components/atoms/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((message: string, variant: ToastData['variant'] = 'success') => {
    const id = uuidv4()
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, dismiss }
}
