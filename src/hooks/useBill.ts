'use client'

import useSWR from 'swr'
import type { BillData, SplitMode } from '@/src/types/bill.types'
import { useDeviceId } from './useDeviceId'

const fetcher = async (url: string) => {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export function useBill(billId: string) {
  const deviceId = useDeviceId()
  const { data, error, mutate, isLoading } = useSWR<BillData>(
    billId ? `/api/bills/${billId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const updateTitle = async (title: string) => {
    await fetch(`/api/bills/${billId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
      body: JSON.stringify({ title }),
    })
    await mutate()
  }

  const updateSplitMode = async (splitMode: SplitMode) => {
    await fetch(`/api/bills/${billId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
      body: JSON.stringify({ splitMode }),
    })
    await mutate()
  }

  return { bill: data, error, isLoading, mutate, updateTitle, updateSplitMode, deviceId }
}
