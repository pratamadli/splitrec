'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBill } from '@/src/hooks/useBill'
import { Logo } from '@/src/components/atoms/Logo'
import { Button } from '@/src/components/atoms/Button'
import { SettlementResult } from '@/src/components/organisms/SettlementResult'
import { ShareButton } from '@/src/components/molecules/ShareButton'
import { Spinner } from '@/src/components/atoms/Spinner'
import { generateDeviceId } from '@/src/lib/device'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BillResultPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { bill, isLoading, deviceId } = useBill(id)
  const [creating, setCreating] = useState(false)

  const isOwner = !!deviceId

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Tagihan tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
        </div>
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-xl font-semibold text-brand-blue">Hasil Pembagian</h1>
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/bills/${id}`)}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 pb-4">
        <SettlementResult bill={bill} result={null} />
      </div>

      {/* Actions */}
      <div className="px-4 pb-8 flex flex-col gap-2">
        <ShareButton shareToken={bill.shareToken} billId={bill.id} createdAt={bill.createdAt} />
        <Button variant="ghost" isLoading={creating} onClick={handleCreateNew} className="w-full">
          Buat Tagihan Baru
        </Button>
      </div>
    </div>
  )
}
