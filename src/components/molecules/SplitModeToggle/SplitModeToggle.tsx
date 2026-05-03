'use client'

import { cn } from '@/src/lib/cn'
import { useLang } from '@/src/contexts/LanguageContext'
import type { SplitMode } from '@/src/types/bill.types'

interface SplitModeToggleProps {
  mode: SplitMode
  onChange: (mode: SplitMode) => void
  disabled?: boolean
}

export function SplitModeToggle({ mode, onChange, disabled }: SplitModeToggleProps) {
  const { t } = useLang()
  return (
    <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 gap-1 bg-gray-50 dark:bg-gray-800 w-fit">
      {(['item', 'equal'] as SplitMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          disabled={disabled}
          className={cn(
            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors min-w-11',
            mode === m
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-brand-gray hover:text-gray-700 dark:hover:text-gray-200'
          )}
        >
          {m === 'item' ? t('split.per_item') : t('split.equal')}
        </button>
      ))}
    </div>
  )
}
