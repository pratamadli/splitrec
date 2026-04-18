'use client'

import { useCallback } from 'react'

export function useShareLink() {
  const getShareUrl = useCallback((token: string) => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/s/${token}`
  }, [])

  return { getShareUrl }
}
