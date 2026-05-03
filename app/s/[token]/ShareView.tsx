'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/src/components/atoms/Logo'
import { Button } from '@/src/components/atoms/Button'
import { SettlementResult } from '@/src/components/organisms/SettlementResult'
import { ShareButton } from '@/src/components/molecules/ShareButton'
import { generateDeviceId } from '@/src/lib/device'
import type { BillData } from '@/src/types/bill.types'

interface ShareViewProps {
  bill: BillData
}

export function ShareView({ bill }: ShareViewProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [paidOverrides, setPaidOverrides] = useState<Record<string, boolean>>({})

  const handleTogglePaid = async (fromParticipantId: string, toParticipantId: string, paid: boolean) => {
    const key = `${fromParticipantId}:${toParticipantId}`
    setPaidOverrides((prev) => ({ ...prev, [key]: paid }))
    await fetch(`/api/bills/${bill.id}/settlements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromParticipantId, toParticipantId, paid }),
    })
  }

  const billWithPaid: BillData = {
    ...bill,
    debts: bill.debts.map((d) => ({
      ...d,
      paid: paidOverrides[`${d.from.id}:${d.to.id}`] ?? d.paid,
    })),
  }

  const handleCreateNew = async () => {
    setCreating(true)
    try {
      const newDeviceId = generateDeviceId()
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-id': newDeviceId },
        body: JSON.stringify({ title: 'Tagihan Baru', deviceId: newDeviceId }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/bills/${data.id}`)
    } catch {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
        </div>
        <div className="mt-3">
          <h1 className="text-xl font-semibold text-brand-blue">Hasil Pembagian</h1>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 pb-4">
        <SettlementResult
          bill={billWithPaid}
          result={null}
          isOwner={false}
          onTogglePaid={handleTogglePaid}
        />
      </div>

      {/* Actions */}
      <div className="px-4 pb-8 flex flex-col gap-3">
        <ShareButton shareToken={bill.shareToken} billId={bill.id} createdAt={bill.createdAt} />
        <Button variant="ghost" isLoading={creating} onClick={handleCreateNew} className="w-full">
          Buat Tagihan Baru
        </Button>
      </div>
    </div>
  )
}
