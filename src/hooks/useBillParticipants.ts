'use client'

import { useCallback } from 'react'
import { useDeviceId } from './useDeviceId'

export function useBillParticipants(billId: string, mutate: () => void) {
  const deviceId = useDeviceId()

  const addParticipant = useCallback(
    async (name: string) => {
      const res = await fetch(`/api/bills/${billId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Gagal menambah peserta')
      await mutate()
    },
    [billId, deviceId, mutate]
  )

  const deleteParticipant = useCallback(
    async (participantId: string) => {
      await fetch(`/api/participants/${participantId}`, {
        method: 'DELETE',
        headers: { 'x-device-id': deviceId },
      })
      await mutate()
    },
    [deviceId, mutate]
  )

  return { addParticipant, deleteParticipant }
}
