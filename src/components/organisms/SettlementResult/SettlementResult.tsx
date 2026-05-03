'use client'

import { useState, useRef } from 'react'
import { SettlementRow, type BreakdownLine } from '@/src/components/molecules/SettlementRow'
import { AdSlot } from '@/src/components/atoms/AdSlot'
import type { BillData, ParticipantData, PurchaseData } from '@/src/types/bill.types'
import type { CalculateResult } from '@/src/types/api.types'

interface SettlementResultProps {
  bill: BillData
  result: CalculateResult | null
  isOwner: boolean
  onUpdateBankInfo?: (participantId: string, bankName: string | null, bankAccount: string | null) => Promise<void>
  onTogglePaid?: (fromParticipantId: string, toParticipantId: string, paid: boolean) => void
}

function r2(n: number) { return Math.round(n * 100) / 100 }

function computeBreakdown(
  participantId: string,
  purchases: PurchaseData[],
  totalParticipants: number
): BreakdownLine[] {
  const lines: BreakdownLine[] = []
  if (totalParticipants === 0) return lines

  for (const purchase of purchases) {
    if (purchase.items.length === 0) {
      const share = r2(purchase.totalAmount / totalParticipants)
      lines.push({ purchaseTitle: purchase.title, amount: share, items: null })
    } else {
      let myItemTotal = 0
      let grandItemTotal = 0
      const myItems: Array<{ name: string; amount: number }> = []

      for (const item of purchase.items) {
        const itemDiscount = item.discount ?? 0
        const consumerQtySum = item.consumers.reduce((cq, c) => cq + c.quantity, 0)

        if (item.consumers.length === 0) {
          const itemCost = r2(item.price * item.quantity - itemDiscount)
          grandItemTotal = r2(grandItemTotal + itemCost)
          if (purchase.payer.id === participantId) {
            myItems.push({ name: item.name, amount: itemCost })
            myItemTotal = r2(myItemTotal + itemCost)
          }
        } else {
          let itemGrand = 0
          for (const c of item.consumers) {
            const ds = consumerQtySum > 0 ? r2(itemDiscount * c.quantity / consumerQtySum) : 0
            itemGrand = r2(itemGrand + r2(item.price * c.quantity - ds))
          }
          grandItemTotal = r2(grandItemTotal + itemGrand)

          const mine = item.consumers.find((c) => c.participant.id === participantId)
          if (mine) {
            const discountShare = consumerQtySum > 0 ? r2(itemDiscount * mine.quantity / consumerQtySum) : 0
            const amount = r2(item.price * mine.quantity - discountShare)
            myItems.push({ name: item.name, amount })
            myItemTotal = r2(myItemTotal + amount)
          }
        }
      }

      const charges = purchase.charges
      if (charges) {
        if (grandItemTotal > 0 && myItemTotal > 0) {
          const weight = myItemTotal / grandItemTotal
          const chargesTotal = r2(purchase.totalAmount - grandItemTotal)
          const chargesShare = r2(weight * chargesTotal)
          const total = r2(myItemTotal + chargesShare)

          const extraItems: Array<{ name: string; amount: number }> = [...myItems]
          if (chargesShare > 0) extraItems.push({ name: 'Pajak & biaya lainnya (proporsional)', amount: chargesShare })
          lines.push({ purchaseTitle: purchase.title, amount: total, items: extraItems })
        }
      } else {
        if (myItems.length > 0) {
          lines.push({
            purchaseTitle: purchase.title,
            amount: myItems.reduce((s, i) => s + i.amount, 0),
            items: myItems,
          })
        }
      }
    }
  }

  return lines
}

// ─── Bank Info Editor ─────────────────────────────────────────────────────────

interface BankInfoCardProps {
  participant: ParticipantData
  isOwner: boolean
  onSave: (bankName: string | null, bankAccount: string | null) => Promise<void>
}

function BankInfoCard({ participant, isOwner, onSave }: BankInfoCardProps) {
  const [editing, setEditing] = useState(false)
  const [bankName, setBankName] = useState(participant.bankName ?? '')
  const [bankAccount, setBankAccount] = useState(participant.bankAccount ?? '')
  const [saving, setSaving] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasBankInfo = participant.bankName || participant.bankAccount

  const handleSave = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaving(true)
    try {
      await onSave(bankName.trim() || null, bankAccount.trim() || null)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (editing && isOwner) {
    return (
      <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/5 px-3 py-3 flex flex-col gap-2">
        <p className="text-xs font-semibold text-brand-blue">{participant.name}</p>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Nama bank (cth. BCA, Mandiri)"
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <input
          type="text"
          inputMode="numeric"
          value={bankAccount}
          onChange={(e) => setBankAccount(e.target.value)}
          placeholder="Nomor rekening"
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <div className="flex gap-2 pt-0.5">
          <button
            onClick={() => { setBankName(participant.bankName ?? ''); setBankAccount(participant.bankAccount ?? ''); setEditing(false) }}
            className="flex-1 h-8 rounded-lg text-xs text-brand-gray border border-gray-200 bg-white"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-2 h-8 rounded-lg text-xs font-semibold text-white bg-brand-blue disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800">{participant.name}</p>
        {hasBankInfo ? (
          <p className="text-xs text-gray-500 truncate">
            {[participant.bankName, participant.bankAccount].filter(Boolean).join(' · ')}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">Belum diisi</p>
        )}
      </div>
      {isOwner && (
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-brand-blue shrink-0"
        >
          {hasBankInfo ? 'Ubah' : '+ Isi'}
        </button>
      )}
    </div>
  )
}

// ─── SettlementResult ─────────────────────────────────────────────────────────

export function SettlementResult({ bill, result, isOwner, onUpdateBankInfo, onTogglePaid }: SettlementResultProps) {
  const debts = result?.debts ?? bill.debts.map((d) => ({
    fromParticipantId: d.from.id,
    fromName: d.from.name,
    toParticipantId: d.to.id,
    toName: d.to.name,
    amount: d.amount,
    paid: d.paid,
  }))

  const participantsMap = new Map<string, ParticipantData>(
    bill.participants.map((p) => [p.id, p])
  )

  // Group debts by payer, including creditor bank info and paid status
  const debtsByFrom = new Map<string, Array<{
    fromParticipantId: string
    toParticipantId: string
    toName: string
    amount: number
    bankName?: string | null
    bankAccount?: string | null
    paid?: boolean
  }>>()
  for (const debt of debts) {
    const creditor = participantsMap.get(debt.toParticipantId)
    const existing = debtsByFrom.get(debt.fromParticipantId) ?? []
    debtsByFrom.set(debt.fromParticipantId, [
      ...existing,
      {
        fromParticipantId: debt.fromParticipantId,
        toParticipantId: debt.toParticipantId,
        toName: debt.toName,
        amount: debt.amount,
        bankName: creditor?.bankName,
        bankAccount: creditor?.bankAccount,
        paid: (debt as { paid?: boolean }).paid ?? false,
      },
    ])
  }

  // Total received per creditor
  const receivedByTo = new Map<string, number>()
  for (const debt of debts) {
    receivedByTo.set(debt.toParticipantId, (receivedByTo.get(debt.toParticipantId) ?? 0) + debt.amount)
  }

  const creditors = bill.participants.filter((p) => (receivedByTo.get(p.id) ?? 0) > 0.01)
  const totalParticipants = bill.participants.length

  return (
    <section className="px-4 py-4 flex flex-col gap-2">
      <AdSlot position="after_split_screen" />

      {debts.length > 0 ? (
        <div className="rounded-lg bg-brand-green/10 border border-brand-green/30 px-4 py-3 mb-2 text-center">
          <p className="text-sm text-brand-green font-medium">Tagihan selesai dihitung!</p>
          <p className="text-xs text-brand-gray mt-0.5">
            {bill.participants.length} orang · {debts.length} transfer
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-brand-green/10 border border-brand-green/30 px-4 py-3 mb-2 text-center">
          <p className="text-sm text-brand-green font-medium">Semua sudah lunas! 🎉</p>
        </div>
      )}

      {/* Bank info section for creditors */}
      {creditors.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide mb-2">
            Info Rekening Penerima
          </p>
          <div className="flex flex-col gap-2">
            {creditors.map((p) => (
              <BankInfoCard
                key={p.id}
                participant={p}
                isOwner={isOwner}
                onSave={(bankName, bankAccount) =>
                  onUpdateBankInfo ? onUpdateBankInfo(p.id, bankName, bankAccount) : Promise.resolve()
                }
              />
            ))}
          </div>
        </div>
      )}

      {bill.participants.map((participant) => {
        const myDebts = debtsByFrom.get(participant.id) ?? []
        const received = receivedByTo.get(participant.id) ?? 0
        const breakdown = computeBreakdown(participant.id, bill.purchases, totalParticipants)

        return (
          <SettlementRow
            key={participant.id}
            name={participant.name}
            debts={myDebts}
            received={received}
            breakdown={breakdown}
            onTogglePaid={onTogglePaid}
          />
        )
      })}
    </section>
  )
}
