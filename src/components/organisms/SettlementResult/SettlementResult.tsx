'use client'

import { SettlementRow } from '@/src/components/molecules/SettlementRow'
import { BalanceRow } from '@/src/components/molecules/BalanceRow'
import { AdSlot } from '@/src/components/atoms/AdSlot'
import { Button } from '@/src/components/atoms/Button'
import type { BillData } from '@/src/types/bill.types'
import type { CalculateResult } from '@/src/types/api.types'

interface SettlementResultProps {
  bill: BillData
  result: CalculateResult | null
  isCalculating: boolean
  isOwner: boolean
  onCalculate: () => Promise<void>
}

export function SettlementResult({
  bill,
  result,
  isCalculating,
  isOwner,
  onCalculate,
}: SettlementResultProps) {
  const debts = result?.debts ?? bill.debts.map((d) => ({
    fromParticipantId: d.from.id,
    fromName: d.from.name,
    toParticipantId: d.to.id,
    toName: d.to.name,
    amount: d.amount,
  }))

  const balances = result?.balances ?? []

  return (
    <section className="px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand-blue">Hasil Pembagian</h2>
        {isOwner && (
          <Button size="sm" onClick={onCalculate} isLoading={isCalculating}>
            Hitung Ulang
          </Button>
        )}
      </div>

      {debts.length === 0 ? (
        <div className="bg-brand-green/10 rounded-2xl p-5 text-center">
          <p className="text-brand-green font-semibold">🎉 Semua sudah lunas!</p>
          <p className="text-xs text-brand-gray mt-1">Tidak ada hutang yang perlu dibayar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
          {debts.map((d, i) => (
            <SettlementRow key={i} from={{ id: d.fromParticipantId, name: d.fromName }} to={{ id: d.toParticipantId, name: d.toName }} amount={d.amount} />
          ))}
        </div>
      )}

      <AdSlot position="after_split_screen" />

      {balances.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
          <p className="text-xs font-semibold text-brand-gray pt-3 pb-1">Rincian per orang</p>
          {balances.map((b) => (
            <BalanceRow key={b.participantId} balance={b} />
          ))}
        </div>
      )}
    </section>
  )
}
