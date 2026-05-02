'use client'

import { useCallback } from 'react'
import type { KeyedMutator } from 'swr'
import { useDeviceId } from './useDeviceId'
import type { BillData } from '@/src/types/bill.types'

export function useBillParticipants(billId: string, mutate: KeyedMutator<BillData>) {
  const deviceId = useDeviceId()

  const addParticipant = useCallback(
    async (name: string) => {
      const tempId = `temp-${Date.now()}`
      await mutate(
        (cur) => cur ? { ...cur, participants: [...cur.participants, { id: tempId, name }] } : cur,
        { revalidate: false }
      )
      try {
        const res = await fetch(`/api/bills/${billId}/participants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error('Gagal menambah peserta')
      } catch (e) {
        await mutate()
        throw e
      }
      await mutate()
    },
    [billId, deviceId, mutate]
  )

  const deleteParticipant = useCallback(
    async (participantId: string) => {
      await mutate(
        (cur) => cur ? { ...cur, participants: cur.participants.filter((p) => p.id !== participantId) } : cur,
        { revalidate: false }
      )
      try {
        await fetch(`/api/participants/${participantId}`, {
          method: 'DELETE',
          headers: { 'x-device-id': deviceId },
        })
      } catch {
        // silent — server will confirm on revalidate
      }
      await mutate()
    },
    [deviceId, mutate]
  )

  const updateBankInfo = useCallback(
    async (participantId: string, bankName: string | null, bankAccount: string | null) => {
      const res = await fetch(`/api/participants/${participantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
        body: JSON.stringify({ bankName, bankAccount }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan info rekening')
      await mutate()
    },
    [deviceId, mutate]
  )

  return { addParticipant, deleteParticipant, updateBankInfo }
}
