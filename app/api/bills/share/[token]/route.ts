import { NextResponse } from 'next/server'
import { getBillByToken } from '@/src/services/bill.service'
import { apiError } from '@/src/lib/api'

type Params = { params: Promise<{ token: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { token } = await params
    const bill = await getBillByToken(token)
    if (!bill) return apiError('Bill not found', 404)

    return NextResponse.json({
      id: bill.id,
      title: bill.title,
      shareToken: bill.shareToken,
      splitMode: bill.splitMode,
      currency: bill.currency,
      createdAt: bill.createdAt,
      participants: bill.participants.map((p) => ({ id: p.id, name: p.name })),
      purchases: bill.purchases.map((p) => ({
        id: p.id,
        title: p.title,
        totalAmount: Number(p.totalAmount),
        payer: { id: p.payer.id, name: p.payer.name },
        items: p.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          note: item.note,
          consumers: item.consumers.map((c) => ({
            participant: { id: c.participant.id, name: c.participant.name },
            quantity: c.quantity,
          })),
        })),
      })),
      debts: bill.debts.map((d) => ({
        id: d.id,
        amount: Number(d.amount),
        from: { id: d.from.id, name: d.from.name },
        to: { id: d.to.id, name: d.to.name },
      })),
    })
  } catch {
    return apiError('Internal server error', 500)
  }
}
