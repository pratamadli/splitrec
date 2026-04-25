import { NextResponse } from 'next/server'
import { addItem } from '@/src/services/item.service'
import { apiError, verifyBillOwnership, getDeviceId, resolvePurchaseBillId } from '@/src/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const billId = await resolvePurchaseBillId(id)
    if (!billId) return apiError('Purchase not found', 404)
    const isOwner = await verifyBillOwnership(billId, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    const body = await request.json()
    const { name, price, note = null, consumers = [] } = body as {
      name?: string
      price?: number
      note?: string | null
      consumers?: { participantId: string; quantity: number }[]
    }

    if (!name?.trim()) return apiError('name is required', 400, { field: 'name' })
    if (!price || price <= 0) return apiError('price must be positive', 400, { field: 'price' })
    if (price > 999_999_999.99) return apiError('price too large', 400, { field: 'price' })

    for (const consumer of consumers) {
      if (!Number.isInteger(consumer.quantity) || consumer.quantity < 1 || consumer.quantity > 999)
        return apiError('consumer quantity must be 1–999', 400, { field: 'consumers' })
    }

    const item = await addItem(id, name, price, note, consumers)
    return NextResponse.json(
      { id: item.id, name: item.name, price: Number(item.price), quantity: item.quantity, note: item.note },
      { status: 201 }
    )
  } catch {
    return apiError('Internal server error', 500)
  }
}
