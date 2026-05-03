'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Lang, type TranslationKey, createT } from '@/src/lib/i18n'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey, vars?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  setLang: () => {},
  t: createT('id'),
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id')

  useEffect(() => {
    const saved = localStorage.getItem('splitrec-lang') as Lang | null
    if (saved === 'id' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('splitrec-lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: createT(lang) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
