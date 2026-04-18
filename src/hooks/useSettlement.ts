'use client'

import { useState, useCallback } from 'react'
import { useDeviceId } from './useDeviceId'
import type { CalculateResult } from '@/src/types/api.types'

export function useSettlement(billId: string, mutate: () => void) {
  const deviceId = useDeviceId()
  const [isCalculating, setIsCalculating] = useState(false)

  const calculate = useCallback(async (): Promise<CalculateResult | null> => {
    setIsCalculating(true)
    try {
      const res = await fetch(`/api/bills/${billId}/calculate`, {
        method: 'POST',
        headers: { 'x-device-id': deviceId },
      })
      if (!res.ok) return null
      const result: CalculateResult = await res.json()
      await mutate()
      return result
    } finally {
      setIsCalculating(false)
    }
  }, [billId, deviceId, mutate])

  return { calculate, isCalculating }
}
