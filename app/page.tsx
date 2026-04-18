'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/src/components/atoms/Logo'
import { Button } from '@/src/components/atoms/Button'
import { generateDeviceId } from '@/src/lib/device'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const deviceId = generateDeviceId()
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
        body: JSON.stringify({ title: 'Tagihan Baru', deviceId }),
      })
      if (!res.ok) throw new Error('Failed to create bill')
      const data = await res.json()
      router.push(`/bills/${data.id}`)
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full">
        <Logo size="lg" />
        <div className="text-center flex flex-col gap-2">
          <p className="text-gray-500 text-base">Split receipts, not friendships.</p>
        </div>
        <Button
          onClick={handleCreate}
          isLoading={isLoading}
          className="w-full h-14 text-base font-semibold"
        >
          Buat Tagihan Baru
        </Button>
        <p className="text-xs text-gray-400 text-center">
          Tidak perlu daftar. Bagikan link ke teman setelah selesai.
        </p>
      </div>
    </div>
  )
}
