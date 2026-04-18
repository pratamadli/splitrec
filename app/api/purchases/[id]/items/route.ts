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
    const { name, price, quantity = 1, note = null, consumerIds = [] } = body as {
      name?: string
      price?: number
      quantity?: number
      note?: string | null
      consumerIds?: string[]
    }

    if (!name?.trim()) return apiError('name is required', 400, { field: 'name' })
    if (!price || price <= 0) return apiError('price must be positive', 400, { field: 'price' })
    if (price > 999_999_999.99) return apiError('price too large', 400, { field: 'price' })
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999)
      return apiError('quantity must be 1–999', 400, { field: 'quantity' })

    const item = await addItem(id, name, price, quantity, note, consumerIds)
    return NextResponse.json(
      { id: item.id, name: item.name, price: Number(item.price), quantity: item.quantity, note: item.note },
      { status: 201 }
    )
  } catch {
    return apiError('Internal server error', 500)
  }
}
