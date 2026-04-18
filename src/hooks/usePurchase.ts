'use client'

import { useCallback } from 'react'
import { useDeviceId } from './useDeviceId'

export function usePurchase(billId: string, mutate: () => void) {
  const deviceId = useDeviceId()

  const addPurchase = useCallback(
    async (data: { title: string; paidBy: string; totalAmount: number }) => {
      const res = await fetch(`/api/bills/${billId}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal menambah purchase')
      await mutate()
    },
    [billId, deviceId, mutate]
  )

  const updatePurchase = useCallback(
    async (purchaseId: string, data: { title?: string; paidBy?: string; totalAmount?: number }) => {
      await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
        body: JSON.stringify(data),
      })
      await mutate()
    },
    [deviceId, mutate]
  )

  const deletePurchase = useCallback(
    async (purchaseId: string) => {
      await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE',
        headers: { 'x-device-id': deviceId },
      })
      await mutate()
    },
    [deviceId, mutate]
  )

  const addItem = useCallback(
    async (
      purchaseId: string,
      data: { name: string; price: number; quantity: number; note: string | null; consumerIds: string[] }
    ) => {
      const res = await fetch(`/api/purchases/${purchaseId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Gagal menambah item')
      await mutate()
    },
    [deviceId, mutate]
  )

  const deleteItem = useCallback(
    async (itemId: string) => {
      await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'x-device-id': deviceId },
      })
      await mutate()
    },
    [deviceId, mutate]
  )

  return { addPurchase, updatePurchase, deletePurchase, addItem, deleteItem }
}
