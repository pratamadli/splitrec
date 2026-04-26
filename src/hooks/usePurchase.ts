'use client'

import { useCallback } from 'react'
import type { KeyedMutator } from 'swr'
import { useDeviceId } from './useDeviceId'
import type { BillData } from '@/src/types/bill.types'

type ItemConsumer = { participantId: string; quantity: number }
type ItemData = { name: string; price: number; note: string | null; consumers: ItemConsumer[] }

export function usePurchase(billId: string, mutate: KeyedMutator<BillData>) {
  const deviceId = useDeviceId()

  const addPurchase = useCallback(
    async (data: { title: string; paidBy: string; totalAmount: number }): Promise<string> => {
      const tempId = `temp-${Date.now()}`
      const payer = { id: data.paidBy, name: '' }
      await mutate(
        (cur) => cur
          ? {
              ...cur,
              purchases: [
                ...cur.purchases,
                { id: tempId, title: data.title, totalAmount: data.totalAmount, payer, charges: null, items: [] },
              ],
            }
          : cur,
        { revalidate: false }
      )
      try {
        const res = await fetch(`/api/bills/${billId}/purchases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Gagal menambah purchase')
        const newPurchase: { id: string } = await res.json()
        await mutate()
        return newPurchase.id
      } catch (e) {
        await mutate()
        throw e
      }
    },
    [billId, deviceId, mutate]
  )

  const updatePurchase = useCallback(
    async (
      purchaseId: string,
      data: {
        title?: string
        paidBy?: string
        totalAmount?: number
        charges?: import('@/src/types/bill.types').PurchaseCharges | null
      }
    ) => {
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
      await mutate(
        (cur) => cur ? { ...cur, purchases: cur.purchases.filter((p) => p.id !== purchaseId) } : cur,
        { revalidate: false }
      )
      try {
        await fetch(`/api/purchases/${purchaseId}`, {
          method: 'DELETE',
          headers: { 'x-device-id': deviceId },
        })
      } catch {
        // silent — revalidate will restore if server failed
      }
      await mutate()
    },
    [deviceId, mutate]
  )

  const addItem = useCallback(
    async (purchaseId: string, data: ItemData) => {
      const tempId = `temp-${Date.now()}`
      await mutate(
        (cur) => {
          if (!cur) return cur
          return {
            ...cur,
            purchases: cur.purchases.map((p) =>
              p.id !== purchaseId
                ? p
                : {
                    ...p,
                    items: [
                      ...p.items,
                      {
                        id: tempId,
                        name: data.name,
                        price: data.price,
                        quantity: 1,
                        note: data.note,
                        consumers: data.consumers.map(({ participantId, quantity }) => ({
                          participant: cur.participants.find((pt) => pt.id === participantId) ?? { id: participantId, name: '' },
                          quantity,
                        })),
                      },
                    ],
                  }
            ),
          }
        },
        { revalidate: false }
      )
      try {
        const res = await fetch(`/api/purchases/${purchaseId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Gagal menambah item')
      } catch (e) {
        await mutate()
        throw e
      }
      await mutate()
    },
    [deviceId, mutate]
  )

  const updateItem = useCallback(
    async (itemId: string, data: ItemData) => {
      try {
        const res = await fetch(`/api/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Gagal mengupdate item')
      } catch (e) {
        throw e
      }
      await mutate()
    },
    [deviceId, mutate]
  )

  const deleteItem = useCallback(
    async (itemId: string) => {
      await mutate(
        (cur) => {
          if (!cur) return cur
          return {
            ...cur,
            purchases: cur.purchases.map((p) => ({
              ...p,
              items: p.items.filter((i) => i.id !== itemId),
            })),
          }
        },
        { revalidate: false }
      )
      try {
        await fetch(`/api/items/${itemId}`, {
          method: 'DELETE',
          headers: { 'x-device-id': deviceId },
        })
      } catch {
        // silent
      }
      await mutate()
    },
    [deviceId, mutate]
  )

  return { addPurchase, updatePurchase, deletePurchase, addItem, updateItem, deleteItem }
}
