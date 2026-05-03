'use client'

import { formatIDR } from '@/src/lib/format'
import { useLang } from '@/src/contexts/LanguageContext'
import type { BillData } from '@/src/types/bill.types'

interface BillSummaryProps {
  bill: BillData
}

export function BillSummary({ bill }: BillSummaryProps) {
  const { t } = useLang()
  const purchases = bill.purchases ?? []
  const total = purchases.reduce((s, p) => s + p.totalAmount, 0)

  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-4">
      {[
        { label: t('summary.total'), value: formatIDR(total), accent: true },
        { label: t('summary.participants'), value: String(bill.participants.length) },
        { label: t('summary.transactions'), value: String(purchases.length) },
      ].map(({ label, value, accent }) => (
        <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className={`text-lg font-semibold ${accent ? 'text-brand-blue' : 'text-gray-800 dark:text-gray-100'}`}>
            {value}
          </p>
          <p className="text-xs text-brand-gray mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
