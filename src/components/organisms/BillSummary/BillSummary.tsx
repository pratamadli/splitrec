import { formatIDR } from '@/src/lib/format'
import type { BillData } from '@/src/types/bill.types'

interface BillSummaryProps {
  bill: BillData
}

export function BillSummary({ bill }: BillSummaryProps) {
  const total = bill.purchases.reduce((s, p) => s + p.totalAmount, 0)

  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-4">
      {[
        { label: 'Total', value: formatIDR(total), accent: true },
        { label: 'Peserta', value: String(bill.participants.length) },
        { label: 'Transaksi', value: String(bill.purchases.length) },
      ].map(({ label, value, accent }) => (
        <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
          <p className={`text-lg font-semibold ${accent ? 'text-brand-blue' : 'text-gray-800'}`}>
            {value}
          </p>
          <p className="text-xs text-brand-gray mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
