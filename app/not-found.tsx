'use client'

import Link from 'next/link'
import { Logo } from '@/src/components/atoms/Logo'
import { useLang } from '@/src/contexts/LanguageContext'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
        <Logo size="md" />
        <div className="flex flex-col gap-2">
          <p className="text-6xl font-bold text-brand-blue">404</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('notfound.title')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('notfound.desc')}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg font-medium h-11 px-5 text-sm bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors whitespace-nowrap"
        >
          {t('notfound.back')}
        </Link>
      </div>
    </div>
  )
}
