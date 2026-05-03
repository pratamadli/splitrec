'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/src/components/atoms/Logo'
import { Button } from '@/src/components/atoms/Button'
import { ThemeToggle } from '@/src/components/atoms/ThemeToggle'
import { LangToggle } from '@/src/components/atoms/LangToggle'
import { generateDeviceId } from '@/src/lib/device'
import { useLang } from '@/src/contexts/LanguageContext'
import { version } from '@/package.json'

export default function HomePage() {
  const router = useRouter()
  const { t } = useLang()
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 max-w-sm w-full">
          <Logo size="lg" />
          <div className="text-center flex flex-col gap-2">
            <p className="text-gray-500 dark:text-gray-400 text-base">Split receipts, not friendships.</p>
          </div>
          <Button
            onClick={handleCreate}
            isLoading={isLoading}
            className="w-full h-14 text-base font-semibold"
          >
            {t('common.create_new_bill')}
          </Button>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            {t('home.no_signup')}
          </p>
        </div>
      </main>
      <footer className="py-4 px-6 flex items-center justify-between">
        <p className="text-xs text-gray-300 dark:text-gray-600">{t('home.version')}: {version}</p>
        <div className="flex items-center gap-1">
          <LangToggle />
          <ThemeToggle />
        </div>
      </footer>
    </div>
  )
}
