import { Avatar } from '@/src/components/atoms/Avatar'
import { formatIDR } from '@/src/lib/format'
import { cn } from '@/src/lib/cn'

interface BalanceRowProps {
  balance: {
    participantId: string
    name: string
    paid: number
    consumed: number
    balance: number
  }
}

export function BalanceRow({ balance }: BalanceRowProps) {
  const isPositive = balance.balance > 0.01
  const isNegative = balance.balance < -0.01
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <Avatar name={balance.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{balance.name}</p>
        <p className="text-xs text-brand-gray">
          Bayar {formatIDR(balance.paid)} · Konsumsi {formatIDR(balance.consumed)}
        </p>
      </div>
      <p
        className={cn(
          'text-sm font-semibold shrink-0',
          isPositive && 'text-brand-green',
          isNegative && 'text-destructive',
          !isPositive && !isNegative && 'text-brand-gray'
        )}
      >
        {isPositive ? '+' : ''}{formatIDR(balance.balance)}
      </p>
    </div>
  )
}
