export type SplitMode = 'equal' | 'item'

export interface SplitInput {
  splitMode: SplitMode
  participants: { id: string; name: string }[]
  purchases: {
    id: string
    paidBy: string
    totalAmount: number
    items: { id: string; price: number; quantity: number; consumers: string[] }[]
  }[]
}

export interface SplitOutput {
  balances: { participantId: string; name: string; paid: number; consumed: number; balance: number }[]
  debts: { fromParticipantId: string; fromName: string; toParticipantId: string; toName: string; amount: number }[]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function calculateSplit(input: SplitInput): SplitOutput {
  const { splitMode, participants, purchases } = input

  const paid: Record<string, number> = {}
  const consumed: Record<string, number> = {}

  for (const p of participants) {
    paid[p.id] = 0
    consumed[p.id] = 0
  }

  // Accumulate paid amounts
  for (const purchase of purchases) {
    paid[purchase.paidBy] = round2((paid[purchase.paidBy] ?? 0) + purchase.totalAmount)
  }

  if (splitMode === 'equal') {
    const total = purchases.reduce((sum, p) => round2(sum + p.totalAmount), 0)
    const share = round2(total / participants.length)
    for (const p of participants) {
      consumed[p.id] = share
    }
  } else {
    // item-based split
    for (const purchase of purchases) {
      for (const item of purchase.items) {
        const consumerIds =
          item.consumers.length > 0 ? item.consumers : [purchase.paidBy]
        const itemTotal = round2(item.price * item.quantity)
        const share = round2(itemTotal / consumerIds.length)
        for (const cId of consumerIds) {
          consumed[cId] = round2((consumed[cId] ?? 0) + share)
        }
      }
    }
  }

  const balances = participants.map((p) => ({
    participantId: p.id,
    name: p.name,
    paid: paid[p.id] ?? 0,
    consumed: consumed[p.id] ?? 0,
    balance: round2((paid[p.id] ?? 0) - (consumed[p.id] ?? 0)),
  }))

  // Greedy debt minimization
  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ ...b, remaining: b.balance }))
    .sort((a, b) => b.remaining - a.remaining)

  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ ...b, remaining: Math.abs(b.balance) }))
    .sort((a, b) => b.remaining - a.remaining)

  const debts: SplitOutput['debts'] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    const amount = round2(Math.min(debtor.remaining, creditor.remaining))

    if (amount > 0.01) {
      debts.push({
        fromParticipantId: debtor.participantId,
        fromName: debtor.name,
        toParticipantId: creditor.participantId,
        toName: creditor.name,
        amount,
      })
    }

    debtor.remaining = round2(debtor.remaining - amount)
    creditor.remaining = round2(creditor.remaining - amount)

    if (creditor.remaining < 0.01) ci++
    if (debtor.remaining < 0.01) di++
  }

  return { balances, debts }
}
