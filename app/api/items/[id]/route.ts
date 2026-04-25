import { NextResponse } from 'next/server'
import { updateItem, deleteItem } from '@/src/services/item.service'
import { apiError, verifyBillOwnership, getDeviceId, resolveItemBillId } from '@/src/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const billId = await resolveItemBillId(id)
    if (!billId) return apiError('Item not found', 404)
    const isOwner = await verifyBillOwnership(billId, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    const body = await request.json()
    const { name, price, note, consumers } = body as {
      name?: string
      price?: number
      note?: string | null
      consumers?: { participantId: string; quantity: number }[]
    }

    if (price !== undefined && price <= 0)
      return apiError('price must be positive', 400, { field: 'price' })

    if (consumers !== undefined) {
      for (const consumer of consumers) {
        if (!Number.isInteger(consumer.quantity) || consumer.quantity < 1 || consumer.quantity > 999)
          return apiError('consumer quantity must be 1–999', 400, { field: 'consumers' })
      }
    }

    const item = await updateItem(id, { name, price, note, consumers })
    return NextResponse.json({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      note: item.note,
    })
  } catch {
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const deviceId = getDeviceId(request)
    const billId = await resolveItemBillId(id)
    if (!billId) return apiError('Item not found', 404)
    const isOwner = await verifyBillOwnership(billId, deviceId)
    if (!isOwner) return apiError('Forbidden', 403)

    await deleteItem(id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return apiError('Internal server error', 500)
  }
}
