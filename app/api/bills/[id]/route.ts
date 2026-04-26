import { NextResponse } from 'next/server'
import { getBillById, updateBill, deleteBill } from '@/src/services/bill.service'
import { apiError, verifyBillOwnership, getDeviceId } from '@/src/lib/api'
import type { SplitMode } from '@/src/types/bill.types'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const bill = await getBillById(id)
    if (!bill) return apiError('Bill not found', 404)

    return NextResponse.json({
      id: bill.id,
      title: bill.title,
      shareToken: bill.shareToken,
      splitMode: bill.splitMode,
      currency: bill.currency,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
      participants: bill.participants.map((p) => ({ id: p.id, name: p.name })),
      purchases: bill.purchases.map((p) => ({
        id: p.id,
        title: p.title,
        totalAmount: Number(p.totalAmount),
        payer: { id: p.payer.id, name: p.payer.name },
        charges: p.charges ?? null,
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

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const isOwner = await verifyBillOwnership(id, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    const body = await request.json()
    const { title, splitMode } = body as { title?: string; splitMode?: SplitMode }

    if (title !== undefined && title.trim().length === 0)
      return apiError('title cannot be empty', 400, { field: 'title' })
    if (title !== undefined && title.trim().length > 200)
      return apiError('title too long', 400, { field: 'title' })
    if (splitMode !== undefined && !['equal', 'item'].includes(splitMode))
      return apiError('invalid splitMode', 400, { field: 'splitMode' })

    const bill = await updateBill(id, { title, splitMode })
    return NextResponse.json(bill)
  } catch {
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const isOwner = await verifyBillOwnership(id, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    await deleteBill(id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return apiError('Internal server error', 500)
  }
}
