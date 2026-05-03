'use client'

import { useState } from 'react'
import { formatIDR } from '@/src/lib/format'
import { cn } from '@/src/lib/cn'
import { useLang } from '@/src/contexts/LanguageContext'

function CopyButton({ text }: { text: string }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-brand-gray hover:text-gray-700 dark:hover:text-gray-300 shrink-0 underline whitespace-nowrap"
      title={t('common.copy')}
    >
      {copied ? t('common.copied') : t('common.copy')}
    </button>
  )
}

export interface BreakdownLine {
  purchaseTitle: string
  amount: number
  items: Array<{ name: string; amount: number }> | null
}

interface DebtEntry {
  fromParticipantId: string
  toParticipantId: string
  toName: string
  amount: number
  bankName?: string | null
  bankAccount?: string | null
  paid?: boolean
}

interface SettlementRowProps {
  name: string
  debts: DebtEntry[]
  received: number
  breakdown: BreakdownLine[]
  onTogglePaid?: (fromParticipantId: string, toParticipantId: string, paid: boolean) => void
}

export function SettlementRow({ name, debts, received, breakdown, onTogglePaid }: SettlementRowProps) {
  const { t } = useLang()
  const [expanded, setExpanded] = useState(false)

  const isDebtor = debts.length > 0
  const isCreditor = !isDebtor && received > 0.01
  const totalOwed = debts.reduce((s, d) => s + d.amount, 0)
  const allPaid = isDebtor && debts.length > 0 && debts.every((d) => d.paid)

  let statusText: string
  let amountColor: string

  if (isDebtor) {
    const payTo = debts.map((d) => d.toName).join(', ')
    statusText = allPaid ? `${t('settlement.settled_to')} ${payTo}` : `${t('settlement.pay_to')} ${payTo}`
    amountColor = allPaid ? 'text-brand-green' : 'text-destructive'
  } else if (isCreditor) {
    statusText = t('settlement.receives')
    amountColor = 'text-brand-green'
  } else {
    statusText = t('settlement.settled')
    amountColor = 'text-brand-gray'
  }

  const copyText = debts
    .map((d) => String(d.amount))
    .join('\n')

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="w-full flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center gap-3 text-left min-w-0"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{name}</p>
            <p className={cn('text-xs', allPaid ? 'text-brand-green' : isDebtor ? 'text-brand-gray' : isCreditor ? 'text-brand-green' : 'text-brand-gray')}>
              {statusText}
            </p>
          </div>
          {isDebtor && (
            <p className={cn('text-lg font-semibold shrink-0', allPaid ? 'line-through text-brand-gray' : amountColor)}>
              {formatIDR(totalOwed)}
            </p>
          )}
          {!isDebtor && received > 0.01 && (
            <p className={cn('text-lg font-semibold shrink-0', amountColor)}>{formatIDR(received)}</p>
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
        {isDebtor && !allPaid && <CopyButton text={copyText} />}
        {allPaid && (
          <span className="text-xs font-semibold text-brand-green shrink-0 whitespace-nowrap">{t('settlement.paid')}</span>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
          {isDebtor && (
            <div className="mb-3 flex flex-col gap-2">
              {debts.map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg px-3 py-2 flex items-center justify-between gap-2',
                    d.paid
                      ? 'bg-brand-green/5 border border-brand-green/20'
                      : 'bg-brand-blue/5 border border-brand-blue/15'
                  )}
                >
                  <div className="min-w-0">
                    <p className={cn('text-xs font-medium truncate', d.paid ? 'text-brand-green' : 'text-brand-blue')}>
                      {d.toName}
                    </p>
                    {(d.bankName || d.bankAccount) && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {[d.bankName, d.bankAccount].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {d.bankAccount && <CopyButton text={d.bankAccount} />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onTogglePaid?.(d.fromParticipantId, d.toParticipantId, !d.paid)
                      }}
                      className={cn(
                        'text-xs font-medium rounded-md px-2 py-1 whitespace-nowrap',
                        d.paid
                          ? 'text-brand-green bg-brand-green/10'
                          : 'text-brand-blue bg-brand-blue/10'
                      )}
                    >
                      {d.paid ? t('settlement.paid') : t('settlement.mark_paid')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {breakdown.length === 0 ? (
            <p className="text-xs text-brand-gray">{t('settlement.no_transactions')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {breakdown.map((line, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate pr-2">{line.purchaseTitle}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 shrink-0">{formatIDR(line.amount)}</p>
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
                      <p className="text-xs text-brand-gray">{t('settlement.equal_split')}</p>
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
