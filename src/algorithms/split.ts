export type SplitMode = 'equal' | 'item'

interface PurchaseCharges {
  tax: number
  serviceCharge: number
  gratuity: number
  discount: number
  discountMode: 'equal' | 'item'
}

export interface SplitInput {
  splitMode: SplitMode
  participants: { id: string; name: string }[]
  purchases: {
    id: string
    paidBy: string
    totalAmount: number
    charges?: PurchaseCharges | null
    items: {
      id: string
      price: number
      quantity: number
      consumers: { participantId: string; quantity: number }[]
    }[]
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
  const { participants, purchases } = input

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

  // Per-purchase split mode: no items = equal split, has items = item split
  for (const purchase of purchases) {
    if (purchase.items.length === 0) {
      // Equal split for this purchase
      const share = round2(purchase.totalAmount / participants.length)
      for (const p of participants) {
        consumed[p.id] = round2((consumed[p.id] ?? 0) + share)
      }
    } else {
      // Item-based split for this purchase
      // First pass: accumulate each participant's raw item consumption
      const itemConsumed: Record<string, number> = {}
      for (const p of participants) itemConsumed[p.id] = 0

      for (const item of purchase.items) {
        if (item.consumers.length === 0) {
          itemConsumed[purchase.paidBy] = round2(
            (itemConsumed[purchase.paidBy] ?? 0) + item.price * item.quantity
          )
        } else {
          for (const consumer of item.consumers) {
            itemConsumed[consumer.participantId] = round2(
              (itemConsumed[consumer.participantId] ?? 0) + item.price * consumer.quantity
            )
          }
        }
      }

      const charges = purchase.charges
      if (charges) {
        const { tax, serviceCharge, gratuity, discount, discountMode } = charges
        const itemTotal = Object.values(itemConsumed).reduce((s, v) => s + v, 0)
        const others = Math.max(
          0,
          purchase.totalAmount + discount - itemTotal - tax - serviceCharge - gratuity
        )
        const equalShare = round2((tax + serviceCharge + gratuity + others) / participants.length)

        for (const p of participants) {
          const discountShare =
            discountMode === 'item' && itemTotal > 0
              ? round2(((itemConsumed[p.id] ?? 0) / itemTotal) * discount)
              : round2(discount / participants.length)
          const amount = round2((itemConsumed[p.id] ?? 0) + equalShare - discountShare)
          consumed[p.id] = round2((consumed[p.id] ?? 0) + amount)
        }
      } else {
        for (const p of participants) {
          consumed[p.id] = round2((consumed[p.id] ?? 0) + (itemConsumed[p.id] ?? 0))
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
