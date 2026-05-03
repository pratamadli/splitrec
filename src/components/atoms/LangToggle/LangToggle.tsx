'use client'

import { useLang } from '@/src/contexts/LanguageContext'

export function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
      className="h-8 px-2 flex items-center justify-center rounded-full text-xs font-semibold text-brand-gray hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {lang === 'id' ? 'EN' : 'ID'}
    </button>
  )
}
