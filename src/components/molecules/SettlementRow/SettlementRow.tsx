import { Avatar } from '@/src/components/atoms/Avatar'
import { formatIDR } from '@/src/lib/format'

interface SettlementRowProps {
  from: { id: string; name: string }
  to: { id: string; name: string }
  amount: number
}

export function SettlementRow({ from, to, amount }: SettlementRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <Avatar name={from.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{from.name}</p>
        <p className="text-xs text-brand-gray">bayar ke {to.name}</p>
      </div>
      <p className="text-sm font-semibold text-brand-green shrink-0">{formatIDR(amount)}</p>
      <Avatar name={to.name} size="sm" />
    </div>
  )
}
