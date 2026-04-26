'use client'

import { useState } from 'react'
import { formatIDR } from '@/src/lib/format'
import { cn } from '@/src/lib/cn'

export interface BreakdownLine {
  purchaseTitle: string
  amount: number
  items: Array<{ name: string; amount: number }> | null
}

interface SettlementRowProps {
  name: string
  debts: Array<{ toName: string; amount: number }>
  received: number
  breakdown: BreakdownLine[]
}

export function SettlementRow({ name, debts, received, breakdown }: SettlementRowProps) {
  const [expanded, setExpanded] = useState(false)

  const isDebtor = debts.length > 0
  const isCreditor = !isDebtor && received > 0.01
  const totalOwed = debts.reduce((s, d) => s + d.amount, 0)

  let statusText: string
  let amountText: string
  let amountColor: string

  if (isDebtor) {
    const payTo = debts.map((d) => d.toName).join(', ')
    statusText = `bayar ke ${payTo}`
    amountText = formatIDR(totalOwed)
    amountColor = 'text-destructive'
  } else if (isCreditor) {
    statusText = 'menerima'
    amountText = formatIDR(received)
    amountColor = 'text-brand-green'
  } else {
    statusText = 'lunas'
    amountText = ''
    amountColor = 'text-brand-gray'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{name}</p>
          <p className={cn('text-xs', isDebtor ? 'text-brand-gray' : isCreditor ? 'text-brand-green' : 'text-brand-gray')}>
            {statusText}
          </p>
        </div>
        {amountText && (
          <p className={cn('text-sm font-semibold shrink-0', amountColor)}>{amountText}</p>
        )}
        <svg
          className={cn('h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200', expanded && 'rotate-90')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          {breakdown.length === 0 ? (
            <p className="text-xs text-brand-gray">Tidak ada transaksi</p>
          ) : (
            <div className="flex flex-col gap-3">
              {breakdown.map((line, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 truncate pr-2">{line.purchaseTitle}</p>
                    <p className="text-sm font-medium text-gray-700 shrink-0">{formatIDR(line.amount)}</p>
                  </div>
                  {line.items ? (
                    line.items.map((item, j) => (
                      <div key={j} className="flex items-center justify-between pl-3">
                        <p className="text-xs text-brand-gray truncate pr-2">{item.name}</p>
                        <p className="text-xs text-brand-gray shrink-0">{formatIDR(item.amount)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between pl-3">
                      <p className="text-xs text-brand-gray">Bagi rata</p>
                      <p className="text-xs text-brand-gray">{formatIDR(line.amount)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
