'use client'

import { SettlementRow, type BreakdownLine } from '@/src/components/molecules/SettlementRow'
import { AdSlot } from '@/src/components/atoms/AdSlot'
import type { BillData, PurchaseData } from '@/src/types/bill.types'
import type { CalculateResult } from '@/src/types/api.types'

interface SettlementResultProps {
  bill: BillData
  result: CalculateResult | null
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
      // Compute raw item consumption for this participant
      let myItemTotal = 0
      let grandItemTotal = 0
      const myItems: Array<{ name: string; amount: number }> = []

      for (const item of purchase.items) {
        const consumerQtySum = item.consumers.reduce((cq, c) => cq + c.quantity, 0)
        const itemCost = consumerQtySum > 0 ? r2(item.price * consumerQtySum) : r2(item.price * item.quantity)
        grandItemTotal = r2(grandItemTotal + itemCost)

        if (item.consumers.length === 0) {
          if (purchase.payer.id === participantId) {
            myItems.push({ name: item.name, amount: itemCost })
            myItemTotal = r2(myItemTotal + itemCost)
          }
        } else {
          const mine = item.consumers.find((c) => c.participant.id === participantId)
          if (mine) {
            const amount = r2(item.price * mine.quantity)
            myItems.push({ name: item.name, amount })
            myItemTotal = r2(myItemTotal + amount)
          }
        }
      }

      const charges = purchase.charges
      if (charges) {
        const { tax, serviceCharge, gratuity, discount, discountMode } = charges
        const others = Math.max(0, r2(purchase.totalAmount + discount - grandItemTotal - tax - serviceCharge - gratuity))
        const equalShare = r2((tax + serviceCharge + gratuity + others) / totalParticipants)
        const discountShare = discountMode === 'item' && grandItemTotal > 0
          ? r2((myItemTotal / grandItemTotal) * discount)
          : r2(discount / totalParticipants)

        const total = r2(myItemTotal + equalShare - discountShare)
        if (myItems.length > 0 || equalShare > 0) {
          const extraItems: Array<{ name: string; amount: number }> = [...myItems]
          if (equalShare > 0) extraItems.push({ name: 'Pajak & biaya lainnya (rata)', amount: equalShare })
          if (discountShare > 0) extraItems.push({ name: 'Diskon', amount: -discountShare })
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

export function SettlementResult({ bill, result }: SettlementResultProps) {
  const debts = result?.debts ?? bill.debts.map((d) => ({
    fromParticipantId: d.from.id,
    fromName: d.from.name,
    toParticipantId: d.to.id,
    toName: d.to.name,
    amount: d.amount,
  }))

  // Group debts owed by each participant
  const debtsByFrom = new Map<string, Array<{ toName: string; amount: number }>>()
  for (const debt of debts) {
    const existing = debtsByFrom.get(debt.fromParticipantId) ?? []
    debtsByFrom.set(debt.fromParticipantId, [...existing, { toName: debt.toName, amount: debt.amount }])
  }

  // Total received per creditor
  const receivedByTo = new Map<string, number>()
  for (const debt of debts) {
    receivedByTo.set(debt.toParticipantId, (receivedByTo.get(debt.toParticipantId) ?? 0) + debt.amount)
  }

  const totalParticipants = bill.participants.length

  return (
    <section className="px-4 py-4 flex flex-col gap-2">
      <AdSlot position="after_split_screen" />
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
          />
        )
      })}
    </section>
  )
}
