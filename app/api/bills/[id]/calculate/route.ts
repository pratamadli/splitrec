import { NextResponse } from 'next/server'
import { getBillById, saveBillDebts } from '@/src/services/bill.service'
import { logEvent } from '@/src/services/event.service'
import { calculateSplit } from '@/src/algorithms/split'
import { apiError, verifyBillOwnership, getDeviceId } from '@/src/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const isOwner = await verifyBillOwnership(id, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    const bill = await getBillById(id)
    if (!bill) return apiError('Bill not found', 404)

    const result = calculateSplit({
      splitMode: bill.splitMode as 'equal' | 'item',
      participants: bill.participants.map((p) => ({ id: p.id, name: p.name })),
      purchases: bill.purchases.map((p) => ({
        id: p.id,
        paidBy: p.paidBy,
        totalAmount: Number(p.totalAmount),
        items: p.items.map((item) => ({
          id: item.id,
          price: Number(item.price),
          quantity: item.quantity,
          consumers: item.consumers.map((c) => ({ participantId: c.participantId, quantity: c.quantity })),
        })),
      })),
    })

    await saveBillDebts(id, result.debts)

    logEvent(deviceId, 'split_completed', {
      billId: id,
      participantCount: bill.participants.length,
      debtCount: result.debts.length,
      splitMode: bill.splitMode,
    })

    return NextResponse.json({
      splitMode: bill.splitMode,
      balances: result.balances,
      debts: result.debts,
    })
  } catch {
    return apiError('Internal server error', 500)
  }
}
